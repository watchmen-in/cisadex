import { useEffect, useState } from "react";
import { fetchFeeds } from "../utils/rssFetcher";

export default function RssFeedPanel() {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await fetchFeeds();
        if (!alive) return;
        setFeeds(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("RssFeedPanel fetch failed:", e);
        if (!alive) return;
        setFeeds([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) return <div className="p-4">Loading feeds…</div>;

  return (
    <div className="p-4 space-y-6">
      {(feeds || []).map((feed, idx) => {
        const items = Array.isArray(feed?.items) ? feed.items : [];
        return (
          <section key={feed?.title || idx}>
            <h2 className="text-lg font-semibold">{feed?.title || "Feed"}</h2>
            <ul className="list-disc pl-6">
              {items.slice(0, 10).map((it, i) => (
                <li key={(it?.link || it?.title || i) + i}>
                  <a href={it?.link || "#"} target="_blank" rel="noreferrer">
                    {it?.title || "Untitled"}
                  </a>
                  {it?.pubDate ? <span className="ml-2 text-sm opacity-70">({it.pubDate})</span> : null}
                </li>
              ))}
              {items.length === 0 && <li className="opacity-70">No items</li>}
            </ul>
          </section>
        );
      })}
      {(feeds?.length ?? 0) === 0 && <div className="opacity-70">No feeds available.</div>}
    </div>
  );
}
