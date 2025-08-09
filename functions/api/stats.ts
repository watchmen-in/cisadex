export const onRequestGet: PagesFunction = async ({ env }) => {
const byType = await env.DB.prepare(`SELECT source_type, COUNT(*) c FROM items GROUP BY source_type`).all();
const last24h = await env.DB.prepare(`SELECT COUNT(*) c FROM items WHERE published_at >= datetime('now','-1 day')`).all();
const exploited = await env.DB.prepare(`SELECT COUNT(*) c FROM items WHERE exploited=1`).all();
return new Response(JSON.stringify({
byType: byType.results || [],
last24h: last24h.results?.[0]?.c || 0,
exploited: exploited.results?.[0]?.c || 0
}), { headers: { "content-type":"application/json" }});
};
