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
    
    // Content Security Policy with Google Fonts support
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://demotiles.maplibre.org https://api.maptiler.com",
      "worker-src 'self' blob:",
      "child-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');
    
    // Security headers
    headers.set("Content-Security-Policy", csp);
    headers.set("X-Frame-Options", "DENY");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-XSS-Protection", "1; mode=block");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    
    // Permissions Policy (restrict potentially dangerous features)
    const permissionsPolicy = [
      "accelerometer=()",
      "camera=()",
      "geolocation=()",
      "gyroscope=()",
      "magnetometer=()",
      "microphone=()",
      "payment=()",
      "usb=()"
    ].join(", ");
    headers.set("Permissions-Policy", permissionsPolicy);
    
    return new Response(res.body, { headers, status: res.status, statusText: res.statusText });
  }
  return res;
};
