import { useEffect, useState } from "react";
import { fetchFeeds } from "../utils/rssFetcher";

function FeedSection({ feed }) {
  const items = Array.isArray(feed?.items) ? feed.items : [];
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? items : items.slice(0, 10);
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">{feed?.title || "Feed"}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((it, i) => (
          <a
            key={(it?.link || it?.title || i) + i}
            href={it?.link || "#"}
            target="_blank"
            rel="noreferrer"
            className="focus-ring block bg-bg2 border border-b1 rounded-lg p-4 shadow-e1 hover:shadow-e2 hover:translate-y-[1px] transition"
          >
            <h3 className="font-medium">{it?.title || "Untitled"}</h3>
            {it?.pubDate && <p className="text-xs text-t2 mt-1">{it.pubDate}</p>}
          </a>
        ))}
      </div>
      {items.length > 10 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-brand hover:underline focus-ring"
        >
          {showAll ? "Show less" : "Show more"}
        </button>
      )}
    </section>
  );
}

export default function RssPanel() {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await fetchFeeds();
        if (!alive) return;
        setFeeds(Array.isArray(data) ? data : []);
      } catch {
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
    <div className="p-4 space-y-8">
      {feeds.map((feed, idx) => (
        <FeedSection key={feed?.title || idx} feed={feed} />
      ))}
      {feeds.length === 0 && <div className="text-t2">No feeds available.</div>}
    </div>
  );
}
