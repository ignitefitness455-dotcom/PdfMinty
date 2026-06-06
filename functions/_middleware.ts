export const onRequest: PagesFunction<any> = async (context) => {
  const url = new URL(context.request.url);
  const hostname = url.hostname.toLowerCase();

  // 1. Server-side Canonical Domain & Typo Redirects (301 Permanent Redirect)
  // This directs non-www and typo hostnames cleanly to www.pdfminty.com at the edge.
  // Doing this server-side prevents Google "Redirect Notice" warnings on search results.
  if (hostname === "pdfminty.com" || hostname === "pdfmity.com" || hostname === "www.pdfmity.com") {
    const canonicalUrl = `https://www.pdfminty.com${url.pathname}${url.search}`;
    return Response.redirect(canonicalUrl, 301);
  }

  const response = await context.next();

  // Clone headers to allow modification
  const headers = new Headers(response.headers);

  // 1. Strict Content-Security-Policy (CSP)
  // Standard strict default-src 'self' with permissions for styling, fonts, and images.
  // frame-ancestors is designed to allow rendering inside trusted spaces (like AI Studio previews)
  // while preventing unauthorized malicious clickjacking.
  headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' blob: data: https://images.unsplash.com; connect-src 'self' https://*.pdfminty.pages.dev https://www.pdfminty.com; worker-src 'self' blob:; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self' https://*.google.com https://*.run.app https://*.pages.dev;"
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
