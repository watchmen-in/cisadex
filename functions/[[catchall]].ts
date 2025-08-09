export const onRequest: PagesFunction = async (ctx) => {
  const { request, next } = ctx;
  const url = new URL(request.url);

  // Let APIs/Functions and assets resolve normally
  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/rss")) {
    return next();
  }

  // Try next (static asset or other route)
  const res = await next();
  const acceptsHTML =
    request.method === "GET" &&
    (request.headers.get("accept") || "").includes("text/html");

  // Fallback to SPA entry for client-routed paths
  if (res.status === 404 && acceptsHTML) {
    return fetch(new URL("/index.html", url.origin), request);
  }
  return res;
};
