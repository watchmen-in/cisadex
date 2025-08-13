export const onRequest: PagesFunction = async (ctx) => {
  const { request, next } = ctx;
  const url = new URL(request.url);

  // Let Pages Functions/API and static assets resolve normally
  if (
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/rss")
  ) {
    return next();
  }

  // Try next (static)
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

    // Allow common basemap/style/tiles providers (tighten as needed)
   const csp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*",
  "connect-src 'self' https://demotiles.maplibre.org",
  "font-src 'self' data: https://demotiles.maplibre.org https://*",
  "worker-src 'self' blob:",
].join("; ");
headers.set("Content-Security-Policy", csp);

    return new Response(res.body, { ...res, headers });
  }
  return res;
};
};
