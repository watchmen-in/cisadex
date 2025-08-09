import Parser from "rss-parser";

const parser = new Parser();
const sources = [
  { title: "CISA Alerts", url: "https://www.cisa.gov/uscert/ncas/alerts.xml" },
  { title: "FBI Cyber News", url: "https://www.fbi.gov/investigate/cyber/news/@@rss.xml" },
  { title: "US-CERT Advisories", url: "https://www.cisa.gov/uscert/ncas/current-activity.xml" },
];

export const onRequestGet = async () => {
  const results = await Promise.all(
    sources.map(async (src) => {
      try {
        const feed = await parser.parseURL(src.url);
        return {
          title: src.title,
          items: (feed.items || []).slice(0, 10).map((i) => ({
            title: i.title,
            link: i.link,
            pubDate: i.pubDate,
            contentSnippet: i.contentSnippet,
          })),
        };
      } catch {
        return { title: src.title, items: [] };
      }
    })
  );
  return new Response(JSON.stringify(results), {
    headers: { "content-type": "application/json" },
  });
};
