// functions/[[catchall]].ts
export const onRequest: PagesFunction = async (ctx) => {
  const { request, next } = ctx;
  const url = new URL(request.url);

  // Let APIs/Functions and assets resolve normally
  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/rss")) {
    return next();
  }

  // Try to serve the requested asset/route first
  let res = await next();

  // Only SPA-fallback for HTML navigations
  const acceptsHTML =
    request.method === "GET" &&
    (request.headers.get("accept") || "").includes("text/html");

  if (res.status === 404 && acceptsHTML) {
    // Serve the SPA entry for client-routed paths
    res = await fetch(new URL("/index.html", url.origin), request);
  }

  // For HTML responses, set a CSP that allows your map host(s)
  if (acceptsHTML) {
    const headers = new Headers(res.headers);

    const csp = [
      "default-src 'self'",
      "script-src 'self'",
      // allow inline styles and common basemap/style hosts (adjust as needed)
      "style-src 'self' 'unsafe-inline' https://demotiles.maplibre.org https://basemaps.cartocdn.com https://api.maptiler.com https://*.tiles.mapbox.com",
      // allow raster/vector tiles, sprites, and data URIs
      "img-src 'self' data: blob: https://*",
      // allow font PBF/WOFF from hosts
      "font-src 'self' data: https://*",
      // allow the style.json and tiles endpoints to load
      "connect-src 'self' https://demotiles.maplibre.org https://basemaps.cartocdn.com https://api.maptiler.com https://*.tiles.mapbox.com",
      // allow webworkers
      "worker-src 'self' blob:"
    ].join("; ");

    headers.set("Content-Security-Policy", csp);

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers
    });
  }

  return res;
};
