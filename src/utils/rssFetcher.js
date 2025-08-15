// Mock data for development and fallback
const mockFeeds = [
  {
    title: "CISA Cybersecurity Alerts",
    items: [
      {
        title: "CISA Adds Three Known Exploited Vulnerabilities to Catalog",
        link: "https://www.cisa.gov/news-events/alerts/2024/01/15/cisa-adds-three-known-exploited-vulnerabilities-catalog",
        pubDate: "2024-01-15T16:00:00Z",
        contentSnippet: "CISA has added three new vulnerabilities to the Known Exploited Vulnerabilities Catalog, based on evidence of active exploitation."
      },
      {
        title: "Alert on Compromised WordPress Sites Used in Cybercrime",
        link: "https://www.cisa.gov/news-events/alerts/2024/01/12/alert-compromised-wordpress-sites-used-cybercrime",
        pubDate: "2024-01-12T14:30:00Z",
        contentSnippet: "CISA and FBI warn of compromised WordPress sites being used to facilitate cybercriminal activities."
      },
      {
        title: "Joint Advisory on Russian State-Sponsored Cyber Activities",
        link: "https://www.cisa.gov/news-events/alerts/2024/01/10/joint-advisory-russian-state-sponsored-cyber-activities",
        pubDate: "2024-01-10T10:00:00Z",
        contentSnippet: "International partners issue joint advisory on ongoing Russian state-sponsored cyber threats against critical infrastructure."
      }
    ]
  },
  {
    title: "FBI Cyber News",
    items: [
      {
        title: "FBI Warning: Increase in Ransomware Attacks on Healthcare Sector",
        link: "https://www.fbi.gov/news/press-releases/fbi-warning-increase-ransomware-attacks-healthcare-sector",
        pubDate: "2024-01-14T12:00:00Z",
        contentSnippet: "The FBI has observed a significant increase in ransomware attacks targeting healthcare organizations."
      },
      {
        title: "Internet Crime Report Shows Record $12.5 Billion in Losses",
        link: "https://www.fbi.gov/news/press-releases/internet-crime-report-shows-record-125-billion-losses",
        pubDate: "2024-01-11T15:00:00Z",
        contentSnippet: "The FBI's Internet Crime Complaint Center received over 880,000 complaints in 2023, with losses totaling $12.5 billion."
      }
    ]
  },
  {
    title: "US-CERT Current Activity",
    items: [
      {
        title: "Critical Security Update for Microsoft Exchange Server",
        link: "https://www.cisa.gov/uscert/ncas/current-activity/2024/01/16/critical-security-update-microsoft-exchange-server",
        pubDate: "2024-01-16T09:00:00Z",
        contentSnippet: "Microsoft has released critical security updates for Exchange Server addressing multiple vulnerabilities."
      },
      {
        title: "Apple Releases Security Updates for Multiple Products",
        link: "https://www.cisa.gov/uscert/ncas/current-activity/2024/01/13/apple-releases-security-updates-multiple-products",
        pubDate: "2024-01-13T11:30:00Z",
        contentSnippet: "Apple has released security updates for iOS, iPadOS, macOS, and Safari to address multiple vulnerabilities."
      }
    ]
  }
];

// Performance cache for RSS feeds
const rssCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function fetchFeeds() {
  const startTime = performance.now();
  
  try {
    // Check rate limiting
    if (typeof window !== 'undefined' && !checkRateLimit()) {
      console.warn('RSS fetch rate limited, using cached data');
      const cached = getCachedFeeds();
      if (cached) {
        recordPerformance('rss-fetch-rate-limited', startTime);
        return cached;
      }
    }

    const isDev = location.hostname === "localhost" || location.hostname === "127.0.0.1";
    
    if (isDev) {
      // In development, return mock data with a small delay to simulate network
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = mockFeeds;
      recordPerformance('rss-fetch-dev', startTime);
      return result;
    }

    // Check cache first
    const cached = getCachedFeeds();
    if (cached) {
      recordPerformance('rss-fetch-cached', startTime);
      return cached;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const res = await fetch("/api/rss", {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      console.warn(`RSS fetch failed with status ${res.status}, falling back to mock data`);
      recordPerformance('rss-fetch-error', startTime);
      return mockFeeds;
    }
    
    const data = await res.json();
    
    // Validate and sanitize that we received proper feed data
    if (!Array.isArray(data) || data.length === 0) {
      console.warn('RSS feed returned empty or invalid data, falling back to mock data');
      recordPerformance('rss-fetch-invalid', startTime);
      return mockFeeds;
    }
    
    // Sanitize feed data for security
    const sanitizedData = sanitizeFeeds(data);
    
    // Cache the result
    setCachedFeeds(sanitizedData);
    
    recordPerformance('rss-fetch-success', startTime);
    return sanitizedData;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('RSS fetch timed out, falling back to mock data');
    } else {
      console.error('Failed to fetch RSS feeds:', error);
    }
    recordPerformance('rss-fetch-error', startTime);
    return getCachedFeeds() || mockFeeds;
  }
}

function checkRateLimit() {
  // Simple client-side rate limiting - 1 request per 30 seconds
  const now = Date.now();
  const lastFetch = localStorage.getItem('last-rss-fetch');
  
  if (lastFetch && now - parseInt(lastFetch) < 30000) {
    return false;
  }
  
  localStorage.setItem('last-rss-fetch', now.toString());
  return true;
}

function getCachedFeeds() {
  if (!rssCache.has('feeds')) return null;
  
  const cached = rssCache.get('feeds');
  const now = Date.now();
  
  if (now - cached.timestamp > CACHE_TTL) {
    rssCache.delete('feeds');
    return null;
  }
  
  return cached.data;
}

function setCachedFeeds(data) {
  rssCache.set('feeds', {
    data,
    timestamp: Date.now()
  });
}

function sanitizeFeeds(feeds) {
  return feeds.map(feed => ({
    title: sanitizeText(feed.title),
    items: Array.isArray(feed.items) ? feed.items.map(item => ({
      title: sanitizeText(item.title),
      link: sanitizeUrl(item.link),
      pubDate: item.pubDate,
      contentSnippet: sanitizeText(item.contentSnippet)
    })).slice(0, 20) : [] // Limit items per feed
  }));
}

function sanitizeText(text) {
  if (typeof text !== 'string') return '';
  // Remove HTML tags and limit length
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/[<>'"&]/g, '')
    .substring(0, 500)
    .trim();
}

function sanitizeUrl(url) {
  if (typeof url !== 'string') return '#';
  try {
    const parsed = new URL(url);
    // Only allow https URLs
    if (parsed.protocol !== 'https:') return '#';
    return url.substring(0, 2000); // Limit URL length
  } catch {
    return '#';
  }
}

function recordPerformance(operation, startTime) {
  if (typeof window !== 'undefined' && window.console) {
    const duration = performance.now() - startTime;
    if (process.env.NODE_ENV === 'development') {
      console.debug(`RSS Operation ${operation}: ${duration.toFixed(2)}ms`);
    }
  }
}
