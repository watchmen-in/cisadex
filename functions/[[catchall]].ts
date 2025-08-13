export const onRequest: PagesFunction = async (ctx) => {
  const { request, next } = ctx;
  const url = new URL(request.url);

  // Let APIs, RSS, DATA, and ASSETS resolve normally
  if (
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/rss") ||
    url.pathname.startsWith("/data") ||     // ✅ add this
    url.pathname.startsWith("/assets")      // ✅ good to allow explicitly
  ) {
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

  // (keep your CSP here)
  return res;
};
