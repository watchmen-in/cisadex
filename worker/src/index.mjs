import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({ ignoreAttributes:false, attributeNamePrefix:"@_", parseTagValue:true, parseAttributeValue:true });

const RE = {
  cve: /\bCVE-\d{4}-\d{4,7}\b/gi,
  ipv4: /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g,
  sha256: /\b[a-f0-9]{64}\b/gi,
  domain: /\b(?!-)(?:[a-z0-9-]{1,63}\.)+[a-z]{2,}\b/gi,
  url: /\bhttps?:\/\/[^\s<>"]+\b/gi,
  email: /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi
};

async function sha256(str) {
  const buf = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,"0")).join("");
}

function parseFeed(xml) {
  const obj = parser.parse(xml);
  // RSS
  if (obj?.rss?.channel) {
    const ch = obj.rss.channel;
    const items = Array.isArray(ch.item) ? ch.item : (ch.item ? [ch.item] : []);
    return items.map(i => ({
      title: i.title || "",
      url: i.link || i.guid || "",
      summary: i.description || i.summary || "",
      published_at: i.pubDate || i["dc:date"] || ""
    }));
  }
  // Atom
  if (obj?.feed?.entry) {
    const feed = obj.feed;
    const entries = Array.isArray(feed.entry) ? feed.entry : [feed.entry];
    return entries.map(e => ({
      title: e.title || "",
      url: (Array.isArray(e.link) ? e.link[0]?.["@_href"] : e.link?.["@_href"]) || e.link || "",
      summary: e.summary || e.content || "",
      published_at: e.updated || e.published || ""
    }));
  }
  return [];
}

function extractAll(text) {
  const grab = (re) => Array.from(new Set((text.match(re) || []).map(s=>s.trim())));
  return {
    cves: grab(RE.cve),
    iocs: [
      ...grab(RE.ipv4).map(v=>["ipv4", v]),
      ...grab(RE.sha256).map(v=>["sha256", v]),
      ...grab(RE.domain).map(v=>["domain", v]),
      ...grab(RE.url).map(v=>["url", v]),
      ...grab(RE.email).map(v=>["email", v]),
    ]
  };
}

async function loadKEV(env) {
  const cacheKey = "kev-json@v1";
  const cached = await env.CACHE.get(cacheKey);
  if (cached) return JSON.parse(cached);
  const r = await fetch("https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json");
  const json = await r.json();
  await env.CACHE.put(cacheKey, JSON.stringify(json), { expirationTtl: 12*60*60 });
  const kev = new Set(json.vulnerabilities?.map(v=>v.cveID) || []);
  return kev;
}

async function epssFor(cves, env) {
  if (!cves.length) return {};
  // Batch up to 50 CVEs
  const qs = encodeURIComponent(cves.join(","));
  const r = await fetch(`https://api.first.org/data/v1/epss?cve=${qs}`);
  const j = await r.json().catch(()=>({}));
  const out = {};
  for (const row of j.data || []) out[row.cve] = Number(row.epss) || 0;
  return out;
}

async function insertItem(env, item) {
  const { id, url, title, source, source_type, published_at, summary, content_hash } = item;
  // insert if not exists
  const stmt = env.DB.prepare(`
    INSERT INTO items (id,url,title,source,source_type,published_at,fetched_at,summary,content_hash)
    SELECT ?,?,?,?,?,?,datetime('now'),?,?
    WHERE NOT EXISTS (SELECT 1 FROM items WHERE id=?)
  `).bind(id,url,title,source,source_type,published_at,summary,content_hash,id);
  await stmt.run();
  // seed FTS
  await env.DB.prepare(`INSERT INTO items_fts(rowid,title,summary,content) SELECT (SELECT rowid FROM items WHERE id=?),?,?,?`)
    .bind(id,title||"",summary||"", "").run();
}

export default {
  // Cron: ingest feeds
  async scheduled(event, env, ctx) {
    const feeds = await (await fetch(new URL("../../feeds/feeds.json", import.meta.url))).json();
    for (const f of feeds) {
      try {
        const res = await fetch(f.url, { headers: { "User-Agent":"cisadex/1.0" } });
        if (!res.ok) continue;
        const xml = await res.text();
        const entries = parseFeed(xml).slice(0, 50);
        for (const e of entries) {
          const content_hash = await sha256(`${e.title}|${e.url}|${e.published_at}`);
          const id = content_hash;
          await insertItem(env, {
            id, url:e.url, title:e.title, source:f.name, source_type:f.source_type,
            published_at:e.published_at || null, summary:e.summary || "", content_hash
          });
          // enqueue for enrichment
          await env.ENRICH_QUEUE.send({ id, url:e.url, title:e.title, summary:e.summary, source:f.name });
        }
      } catch (err) {
        console.log("feed error", f.id, String(err));
      }
    }
  },

  // Queue consumer: enrich
  async queue(batch, env, ctx) {
    const kev = await loadKEV(env);
    for (const msg of batch.messages) {
      const { id, url, title, summary } = msg.body;
      const text = `${title}\n${summary}`;
      const { cves, iocs } = extractAll(text);
      const epss = await epssFor(cves.slice(0,50), env);

      // derive fields
      const cve = cves[0] || null;
      const exploited = cve ? (kev.has(cve) ? 1 : 0) : 0;
      const epssScore = cve ? (epss[cve] || 0) : 0;

      await env.DB.prepare(`UPDATE items SET cve=?, exploited=?, epss=? WHERE id=?`).bind(cve, exploited, epssScore, id).run();

      for (const [kind, value] of iocs.slice(0,200)) {
        await env.DB.prepare(`INSERT OR IGNORE INTO iocs (item_id,kind,value) VALUES (?,?,?)`).bind(id,kind,value).run();
      }
    }
  }
};
