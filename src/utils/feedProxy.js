// Feed proxy handler for development
export async function fetchWithProxy(url, feedType = 'RSS') {
  // In development, try direct fetch first (some feeds may have CORS headers)
  try {
    const response = await fetch(url, {
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Accept': feedType === 'RSS' 
          ? 'application/rss+xml, application/xml, text/xml, */*'
          : 'application/json, */*'
      }
    });
    
    if (response.ok) {
      return feedType === 'JSON' 
        ? await response.json()
        : await response.text();
    }
  } catch (corsError) {
    console.log(`Direct fetch failed for ${url}, trying proxy...`);
  }

  // If direct fetch fails, use a public CORS proxy service for development
  const proxyUrls = [
    `https://corsproxy.io/?${encodeURIComponent(url)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    `https://cors-anywhere.herokuapp.com/${url}` // May require demo access
  ];

  for (const proxyUrl of proxyUrls) {
    try {
      const response = await fetch(proxyUrl, {
        headers: {
          'Accept': feedType === 'RSS' 
            ? 'application/rss+xml, application/xml, text/xml, */*'
            : 'application/json, */*'
        }
      });
      
      if (response.ok) {
        return feedType === 'JSON' 
          ? await response.json()
          : await response.text();
      }
    } catch (error) {
      console.log(`Proxy ${proxyUrl} failed:`, error.message);
      continue;
    }
  }

  throw new Error(`All proxy attempts failed for ${url}`);
}