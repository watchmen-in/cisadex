export const onRequest: PagesFunction = async (ctx) => {
  const { request, next } = ctx;
  const url = new URL(request.url);

  // Let APIs/Functions and assets resolve
  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/rss")) {
    return next();
  }

  // Try static/asset first
  let res = await next();

  const acceptsHTML =
    request.method === "GET" &&
    (request.headers.get("accept") || "").includes("text/html");

  // SPA fallback
  if (res.status === 404 && acceptsHTML) {
    res = await fetch(new URL("/index.html", url.origin), request);
  }

  if (acceptsHTML) {
    const headers = new Headers(res.headers);
    const csp = [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "connect-src 'self' https://demotiles.maplibre.org",
      "font-src 'self' data: https://demotiles.maplibre.org",
      "worker-src 'self' blob:"
    ].join('; ');
    headers.set("Content-Security-Policy", csp);
    return new Response(res.body, { headers, status: res.status, statusText: res.statusText });
  }
  return res;
};
