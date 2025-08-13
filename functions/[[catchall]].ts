export const onRequest: PagesFunction = async (ctx) => {
  const { request, next } = ctx;
  const url = new URL(request.url);

  // Let APIs and RSS pass
  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/rss")) {
    return next();
  }

  // If the request targets a static file extension, don't SPA-fallback.
  // Add types as needed (json, geojson, pbf, mvt, png, jpg, webp, svg, css, js, woff2, etc.)
  const ext = url.pathname.split(".").pop()?.toLowerCase();
  const staticExts = new Set([
    "json","geojson","pbf","mvt","png","jpg","jpeg","webp","gif","svg",
    "css","js","map","woff","woff2","ttf","otf","txt","ico"
  ]);
  if (ext && staticExts.has(ext)) {
    return next();
  }

  // Try serving normally
  let res = await next();

  // HTML only?
  const acceptsHTML =
    request.method === "GET" &&
    (request.headers.get("accept") || "").includes("text/html");

  // Fallback only for extensionless client routes
  if (res.status === 404 && acceptsHTML) {
    res = await fetch(new URL("/index.html", url.origin), request);
  }

  // (Optional) CSP — keep your existing domains in here
  if (acceptsHTML) {
    const headers = new Headers(res.headers);
    const csp = [
      "default-src 'self'",
      "script-src 'self'",
      // allow your basemap providers
      "style-src 'self' 'unsafe-inline' https://demotiles.maplibre.org https://basemaps.cartocdn.com https://api.maptiler.com",
      "img-src 'self' data: blob: https://*",
      "font-src 'self' data: https://*",
      "connect-src 'self' https://demotiles.maplibre.org https://basemaps.cartocdn.com https://api.maptiler.com",
      "worker-src 'self' blob:"
    ].join("; ");
    headers.set("Content-Security-Policy", csp);
    return new Response(res.body, { ...res, headers });
  }

  return res;
};
