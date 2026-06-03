export const onRequest: PagesFunction<any> = async (context) => {
  const response = await context.next();

  // Clone headers to allow modification
  const headers = new Headers(response.headers);

  // 1. Strict Content-Security-Policy (CSP)
  // Standard strict default-src 'self' with permissions for styling, fonts, and images.
  // frame-ancestors is designed to allow rendering inside trusted spaces (like AI Studio previews)
  // while preventing unauthorized malicious clickjacking.
  headers.set(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com data:; " +
    "img-src 'self' blob: data:; " +
    "connect-src 'self' https://api.google.com https://generativelanguage.googleapis.com; " +
    "frame-ancestors 'self' https://*.google.com https://*.run.app https://*.pages.dev;"
  );

  // 2. Prevent MIME type sniffing
  headers.set("X-Content-Type-Options", "nosniff");

  // 3. Same-origin protection against clickjacking (with CSP frame-ancestors above for modern security)
  headers.set("X-Frame-Options", "SAMEORIGIN");

  // 4. Referrer policy to control source flow metadata
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // 5. Restrict unused sensor permissions
  headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
