import { useEffect, useState } from "react";

export default function ResourcePanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/links/data/index.json");
        if (!res.ok) throw new Error("bad response");
        const data = await res.json();
        if (!alive) return;
        setItems(Array.isArray(data?.items) ? data.items : []);
      } catch {
        if (!alive) return;
        setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) return <div className="p-4">Loading resources…</div>;

  return (
    <div className="p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it, i) => (
        <a
          key={it?.url || i}
          href={it?.url || "#"}
          target="_blank"
          rel="noreferrer"
          className="focus-ring block bg-bg2 border border-b1 rounded-lg p-4 shadow-e1 hover:shadow-e2 hover:translate-y-[1px] transition"
        >
          <h3 className="font-semibold">{it?.title || "Untitled"}</h3>
          {it?.meta && <p className="mt-1 text-sm text-t2">{it.meta}</p>}
        </a>
      ))}
      {items.length === 0 && <div className="text-t2">No resources available.</div>}
    </div>
  );
}
