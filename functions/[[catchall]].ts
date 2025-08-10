export const onRequest: PagesFunction = async (ctx) => {
  const { request, next } = ctx;
  const url = new URL(request.url);

  // Let APIs/Functions and assets resolve normally
  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/rss")) {
    return next();
  }

  // Try next (static asset or other route)
  let res = await next();
  const acceptsHTML =
    request.method === "GET" &&
    (request.headers.get("accept") || "").includes("text/html");

  // Fallback to SPA entry for client-routed paths
  if (res.status === 404 && acceptsHTML) {
    res = await fetch(new URL("/index.html", url.origin), request);
  }

  if (acceptsHTML) {
    const headers = new Headers(res.headers);
    const csp = [
      "default-src 'self'",
      "img-src 'self' data: https://*",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "connect-src 'self' https://*.cartocdn.com https://basemaps.cartocdn.com https://*.tile.openstreetmap.org https://*.maptiler.com https://*.tiles.mapbox.com https://demotiles.maplibre.org",
      "font-src 'self' https://*",
      "worker-src 'self' blob:"
    ].join('; ');
    headers.set("Content-Security-Policy", csp);
    return new Response(res.body, { ...res, headers });
  }
  return res;
};
