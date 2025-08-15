// CORS proxy for RSS feeds
export default async function handler(req, res) {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter required' });
  }

  // Whitelist of allowed domains for security
  const allowedDomains = [
    'cisa.gov',
    'us-cert.cisa.gov',
    'cert.europa.eu',
    'ncsc.gov.uk',
    'msrc.microsoft.com',
    'cisco.com',
    'vmware.com',
    'adobe.com',
    'oracle.com',
    'apple.com',
    'talosintelligence.com',
    'paloaltonetworks.com',
    'crowdstrike.com',
    'mandiant.com',
    'krebsonsecurity.com',
    'feedburner.com',
    'securityweek.com',
    'darkreading.com',
    'bleepingcomputer.com',
    'arstechnica.com',
    'threatpost.com',
    'secureworks.com',
    'abuse.ch',
    'first.org',
    'openphish.com'
  ];

  try {
    const feedUrl = new URL(url);
    const isAllowed = allowedDomains.some(domain => 
      feedUrl.hostname.includes(domain)
    );

    if (!isAllowed) {
      return res.status(403).json({ error: 'Domain not whitelisted' });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CISAdx Feed Reader/1.0',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      },
      signal: AbortSignal.timeout(15000) // 15 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    const data = await response.text();
    
    res.setHeader('Content-Type', contentType || 'application/xml');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(data);
    
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch feed',
      details: error.message 
    });
  }
}