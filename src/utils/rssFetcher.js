export async function fetchFeeds() {
  try {
    // If you’re not on Cloudflare Functions locally, avoid calling /rss.
    const isDev = location.hostname === "localhost" || location.hostname === "127.0.0.1";
    if (isDev) return []; // or return mock data here

    const res = await fetch("/rss");
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
