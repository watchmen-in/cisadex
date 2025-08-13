export const onRequest: PagesFunction = async (ctx) => {
  const { request, next } = ctx;
  const url = new URL(request.url);

  const acceptsHTML =
    request.method === "GET" &&
    (request.headers.get("accept") || "").includes("text/html");

  // 1) Always pass through APIs, RSS, and DATA (so JSON doesn’t get rewritten to index.html)
  if (
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/rss") ||
    url.pathname.startsWith("/data")
  ) {
    return next();
  }

  // 2) Try static asset / normal route first
  let res = await next();

  // 3) For client-routed paths, fallback to SPA entry
  if (res.status === 404 && acceptsHTML) {
    res = await fetch(new URL("/index.html", url.origin), request);
  }

  // 4) (Optional) add a CSP that allows your map style/tiles/fonts
  if (acceptsHTML) {
    const headers = new Headers(res.headers);
    const csp = [
      "default-src 'self'",
      "script-src 'self'",
      // Allow external style JSON, sprites, glyphs, tiles, and images.
      "style-src 'self' 'unsafe-inline' https://demotiles.maplibre.org https://basemaps.cartocdn.com https://api.maptiler.com https://*.tiles.mapbox.com https://*.tile.openstreetmap.org",
      "img-src 'self' data: blob: https://*",
      "font-src 'self' data: https://*",
      "connect-src 'self' https://demotiles.maplibre.org https://basemaps.cartocdn.com https://api.maptiler.com https://*.tiles.mapbox.com https://*.tile.openstreetmap.org",
      "worker-src 'self' blob:",
    ].join("; ");
    headers.set("Content-Security-Policy", csp);
    return new Response(res.body, { ...res, headers });
  }

  return res;
};
