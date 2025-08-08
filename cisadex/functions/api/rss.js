// Cloudflare Pages Function: /api/rss?url=<encoded RSS URL>
// Example: /api/rss?url=https%3A%2F%2Fwww.cisa.gov%2Fnews-events%2Fnews.xml
export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return new Response(JSON.stringify({ error: "Missing ?url=" }), {
        status: 400,
        headers: corsHeaders("application/json"),
      });
    }

    const upstream = await fetch(url, {
      headers: { "User-Agent": "CISAdex RSS Fetcher" },
    });

    if (!upstream.ok) {
      return new Response(JSON.stringify({ error: `Upstream ${upstream.status}` }), {
        status: 502,
        headers: corsHeaders("application/json"),
      });
    }

    // Just proxy XML through; the client will parse it.
    const xml = await upstream.text();
    return new Response(xml, { headers: corsHeaders("application/xml") });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: corsHeaders("application/json"),
    });
  }
}

function corsHeaders(type = "text/plain") {
  return {
    "content-type": type,
    "access-control-allow-origin": "*",
    "cache-control": "public, max-age=300", // 5 min edge cache
  };
}
