export const onRequest: PagesFunction = async (context) => {
  const response = await context.next();

  // Handle responses with 304, 204 or 1xx statuses which cannot have a body per HTTP spec
  const hasNoBody = 
    response.status === 204 || 
    response.status === 304 || 
    (response.status >= 100 && response.status < 200);

  // Create a mutable copy of the response with safe body handling
  const newResponse = new Response(hasNoBody ? null : response.body, response);

  newResponse.headers.set('X-Content-Type-Options', 'nosniff');
  newResponse.headers.set('X-Frame-Options', 'DENY');
  newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newResponse.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  newResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()');
  newResponse.headers.set('Cross-Origin-Opener-Policy', 'same-origin');

  // IMPORTANT: The Content-Security-Policy string here MUST stay byte-identical
  // with the one defined in public/_headers
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "img-src 'self' blob: data:",
    "connect-src 'self' https://*.googleapis.com https://generativelanguage.googleapis.com https://api.resend.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];
  newResponse.headers.set('Content-Security-Policy', cspDirectives.join('; '));

  return newResponse;
};
