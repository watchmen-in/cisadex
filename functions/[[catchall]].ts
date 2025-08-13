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

    // Merged CSP from both branches
    const csp = [
      "default-src 'self'",
      "script-src 'self'",
      // Allow inline styles and common basemap/style hosts
      "style-src 'self' 'unsafe-inline' https://demotiles.maplibre.org https://basemaps.cartocdn.com https://*.cartocdn.com https://api.maptiler.com https://*.tiles.mapbox.com",
      // Images/fonts from self + data + blob + any https (tile sprites, glyphs, etc.)
      "img-src 'self' data: blob: https://*",
      "font-src 'self' data: https://*",
      // Tile/style/glyph/fetch endpoints used by various providers
      "connect-src 'self' https://demotiles.maplibre.org https://basemaps.cartocdn.com https://*.cartocdn.com https://*.tile.openstreetmap.org https://*.maptiler.com https://*.tiles.mapbox.com",
      "worker-src 'self' blob:"
    ].join("; ");

    headers.set("Content-Security-Policy", csp);

    // Return a new Response (don't spread Response objects)
    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers
    });
  }

  return res;
};
