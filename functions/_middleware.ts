export const onRequest: PagesFunction = async (context) => {
  const response = await context.next();

  // Create mutable headers to avoid runtime errors with immutable response headers (e.g. from static asset fetches)
  const newHeaders = new Headers(response.headers);

  newHeaders.set('X-Content-Type-Options', 'nosniff');
  newHeaders.set('X-Frame-Options', 'DENY');
  newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  newHeaders.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()');
  newHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');

  // Content Security Policy
  // Baseline allow self, google fonts, googleapis (Gemini API), and disallow unsafe-eval
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "img-src 'self' blob: data:",
    "connect-src 'self' https://*.googleapis.com https://generativelanguage.googleapis.com https://api.resend.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];
  newHeaders.set('Content-Security-Policy', cspDirectives.join('; '));

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
};
