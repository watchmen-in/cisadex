import { useEffect, useState } from "react";

export default function FeedList({ filters }) {
  const [items, setItems] = useState([]);
  const qs = new URLSearchParams();
  if (filters.source_type) qs.set("source_type", filters.source_type);
  if (filters.exploited !== undefined) qs.set("exploited", filters.exploited ? "1" : "0");
  if (filters.has_cve !== undefined) qs.set("has_cve", filters.has_cve ? "1" : "0");
  const url = `/api/items?limit=50&${qs.toString()}`;

  useEffect(() => {
    fetch(url).then(r => r.json()).then(setItems).catch(() => setItems([]));
  }, [url]);

  return (
    <div className="divide-y divide-b1">
      {items.map(it => (
        <article key={it.id} className="p-4 hover:bg-bg2/40">
          <div className="flex items-center gap-2 text-xs text-t2">
            <span className="uppercase tracking-wide">{it.source_type}</span>
            <span>•</span>
            <span>{new Date(it.published_at || it.fetched_at).toLocaleString()}</span>
          </div>
          <a href={it.url} target="_blank" rel="noreferrer" className="block text-t1 font-medium mt-1">
            {it.title}
          </a>
          <div className="mt-1 text-sm text-t2 line-clamp-2">{it.summary}</div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {it.cve && <span className="px-2 py-0.5 rounded-full bg-bg2 border border-b1">#{it.cve}</span>}
            {it.exploited ? <span className="px-2 py-0.5 rounded-full bg-err/20 border border-err/40 text-err">Exploited</span> : null}
            {typeof it.epss === "number" && it.epss > 0 ? <span className="px-2 py-0.5 rounded-full bg-warn/20 border border-warn/40 text-warn">EPSS {(it.epss*100).toFixed(1)}%</span> : null}
          </div>
        </article>
      ))}
      {items.length === 0 && <div className="p-6 text-t2">No items yet. The worker will populate within minutes.</div>}
    </div>
  );
}
