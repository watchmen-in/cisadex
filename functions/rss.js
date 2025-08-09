import { XMLParser } from "fast-xml-parser";

const sources = [
  { title: "CISA Alerts", url: "https://www.cisa.gov/uscert/ncas/alerts.xml" },
  { title: "FBI Cyber News", url: "https://www.fbi.gov/investigate/cyber/news/@@rss.xml" },
  { title: "US-CERT Advisories", url: "https://www.cisa.gov/uscert/ncas/current-activity.xml" },
];

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  allowBooleanAttributes: true,
  parseTagValue: true,
  parseAttributeValue: true,
});

function normalizeFeed(xmlObj, srcTitle) {
  // RSS 2.0 shape: { rss: { channel: { item: [...] } } }
  if (xmlObj?.rss?.channel) {
    const ch = xmlObj.rss.channel;
    const items = Array.isArray(ch.item) ? ch.item : ch.item ? [ch.item] : [];
    return {
      title: ch.title || srcTitle,
      items: items.slice(0, 10).map((i) => ({
        title: i.title || "",
        link: (i.link && i.link.href) || i.link || "",
        pubDate: i.pubDate || i["dc:date"] || "",
        contentSnippet: i.description || i.summary || "",
      })),
    };
  }

  // Atom shape: { feed: { entry: [...] } }
  if (xmlObj?.feed?.entry) {
    const feed = xmlObj.feed;
    const entries = Array.isArray(feed.entry) ? feed.entry : [feed.entry];
    return {
      title: feed.title || srcTitle,
      items: entries.slice(0, 10).map((e) => ({
        title: e.title || "",
        link:
          (Array.isArray(e.link) ? e.link[0]?.["@_href"] : e.link?.["@_href"]) ||
          e.link ||
          "",
        pubDate: e.updated || e.published || "",
        contentSnippet: e.summary || e.content || "",
      })),
    };
  }

  // Fallback
  return { title: srcTitle, items: [] };
}

export const onRequestGet = async () => {
  const results = await Promise.all(
    sources.map(async (src) => {
      try {
        const resp = await fetch(src.url, {
          headers: { "User-Agent": "cisadex/1.0" },
        });
        if (!resp.ok) return { title: src.title, items: [] };
        const xml = await resp.text();
        const obj = parser.parse(xml);
        return normalizeFeed(obj, src.title);
      } catch {
        return { title: src.title, items: [] };
      }
    })
  );
  return new Response(JSON.stringify(results), {
    headers: { "content-type": "application/json" },
  });
};

