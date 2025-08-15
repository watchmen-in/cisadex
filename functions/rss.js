import { XMLParser } from "fast-xml-parser";

const sources = [
  { title: "CISA Alerts", url: "https://www.cisa.gov/uscert/ncas/alerts.xml" },
  { title: "FBI Cyber News", url: "https://www.fbi.gov/investigate/cyber/news/@@rss.xml" },
  { title: "US-CERT Advisories", url: "https://www.cisa.gov/uscert/ncas/current-activity.xml" }
];

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  allowBooleanAttributes: true,
  parseTagValue: true,
  parseAttributeValue: true
});

function normalizeFeed(xmlObj, fallbackTitle) {
  // RSS 2.0: { rss: { channel: { item: [...] } } }
  if (xmlObj?.rss?.channel) {
    const ch = xmlObj.rss.channel;
    const items = Array.isArray(ch.item) ? ch.item : (ch.item ? [ch.item] : []);
    return {
      title: ch.title || fallbackTitle,
      items: items.slice(0, 10).map(i => ({
        title: i.title || "",
        link: (i.link && i.link.href) || i.link || "",
        pubDate: i.pubDate || i["dc:date"] || "",
        contentSnippet: i.description || i.summary || ""
      }))
    };
  }

  // Atom: { feed: { entry: [...] } }
  if (xmlObj?.feed?.entry) {
    const feed = xmlObj.feed;
    const entries = Array.isArray(feed.entry) ? feed.entry : [feed.entry];
    return {
      title: feed.title || fallbackTitle,
      items: entries.slice(0, 10).map(e => ({
        title: e.title || "",
        link:
          (Array.isArray(e.link) ? e.link[0]?.["@_href"] : e.link?.["@_href"]) ||
          e.link ||
          "",
        pubDate: e.updated || e.published || "",
        contentSnippet: e.summary || e.content || ""
      }))
    };
  }

  return { title: fallbackTitle, items: [] };
}

async function loadFeedsConfig() {
  try {
    const response = await fetch('/feeds/feeds.json');
    feedsConfig = await response.json();
    return feedsConfig.filter(feed => feed.source_type === 'gov' && feed.type === 'rss').slice(0, 10);
  } catch (error) {
    console.error('Failed to load feeds config:', error);
    return fallbackSources;
  }
}

export const onRequestGet = async () => {
  const sources = await loadFeedsConfig();
  
  const results = await Promise.allSettled(
    sources.map(async (src) => {
      try {
        const headers = { 
          "User-Agent": "CISAdx/2.0 (Federal Cybersecurity Dashboard)",
          "Accept": "application/rss+xml, application/xml, text/xml, */*"
        };
        
        const resp = await fetch(src.url, { 
          headers,
          timeout: 10000 // 10 second timeout
        });
        
        if (!resp.ok) {
          console.warn(`Failed to fetch ${src.name || src.title}: ${resp.status}`);
          return { title: src.name || src.title, items: [], error: `HTTP ${resp.status}` };
        }
        
        const xml = await resp.text();
        const obj = parser.parse(xml);
        const normalized = normalizeFeed(obj, src.name || src.title);
        
        return {
          ...normalized,
          source_id: src.id,
          category: src.source_type,
          priority: src.priority || 1,
          last_updated: new Date().toISOString()
        };
      } catch (error) {
        console.error(`Error processing ${src.name || src.title}:`, error);
        return { 
          title: src.name || src.title, 
          items: [], 
          error: error.message,
          source_id: src.id
        };
      }
    })
  );

  const processedResults = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value)
    .filter(feed => feed.items && feed.items.length > 0);

  const healthInfo = {
    total_feeds: sources.length,
    successful_feeds: processedResults.length,
    failed_feeds: sources.length - processedResults.length,
    last_check: new Date().toISOString()
  };

  return new Response(JSON.stringify({
    feeds: processedResults,
    health: healthInfo
  }), {
    headers: { 
      "content-type": "application/json",
      "cache-control": "public, max-age=300" // 5 minute cache
    }
  });
};
