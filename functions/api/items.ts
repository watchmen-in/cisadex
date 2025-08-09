export const onRequestGet: PagesFunction = async ({ env, request }) => {
const url = new URL(request.url);
const since = url.searchParams.get("since");      // ISO string or days
const q = url.searchParams.get("q") || "";
const source_type = url.searchParams.get("source_type"); // gov|vendor|research|news
const exploited = url.searchParams.get("exploited");     // "1" or "0"
const has_cve = url.searchParams.get("has_cve");         // "1" or "0"
const limit = Math.min(100, Number(url.searchParams.get("limit") || 50));
const offset = Math.max(0, Number(url.searchParams.get("offset") || 0));

let where = [], bind = [];
if (source_type) { where.push("source_type=?"); bind.push(source_type); }
if (exploited === "1") where.push("exploited=1");
if (exploited === "0") where.push("exploited=0");
if (has_cve === "1") where.push("cve IS NOT NULL");
if (has_cve === "0") where.push("cve IS NULL");
if (since) { where.push("published_at >= ?"); bind.push(since); }
let sql = `SELECT id,url,title,source,source_type,published_at,summary,cve,exploited,epss FROM items`;
if (q) {
sql = `SELECT i.id,i.url,i.title,i.source,i.source_type,i.published_at,i.summary,i.cve,i.exploited,i.epss
           FROM items i JOIN items_fts f ON f.rowid = i.rowid
           WHERE f MATCH ?` + (where.length ? ` AND ${where.join(" AND ")}` : "") +
` ORDER BY i.published_at DESC LIMIT ? OFFSET ?`;
bind = [q, ...bind, limit, offset];
} else {
sql += where.length ? ` WHERE ${where.join(" AND ")}` : "";
sql += ` ORDER BY published_at DESC LIMIT ? OFFSET ?`;
bind.push(limit, offset);
}

const rows = await env.DB.prepare(sql).bind(...bind).all();
return new Response(JSON.stringify(rows.results || []), { headers: { "content-type":"application/json" }});
};
