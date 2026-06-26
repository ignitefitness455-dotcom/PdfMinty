export const onRequest: PagesFunction = async (context) => {
  const response = await context.next();

  // Handle responses with 304, 204 or 1xx statuses which cannot have a body per HTTP spec.
  const hasNoBody =
    response.status === 204 ||
    response.status === 304 ||
    (response.status >= 100 && response.status < 200);

  // Generate a per-request nonce for inline scripts/styles.
  const nonce = crypto.randomUUID().replace(/-/g, '').slice(0, 24);

  // For HTML responses, inject the nonce into all inline <script> and <style> tags.
  let body: ReadableStream<Uint8Array> | null = null;
  const contentType = response.headers.get('Content-Type') || '';

  if (!hasNoBody && contentType.includes('text/html')) {
    const originalText = await response.text();
    // Inject nonce attribute into script tags that don't already have one.
    const injected = originalText
      .replace(/<script(?![^>]*\snonce=)([^>]*)>/g, `<script nonce="${nonce}"$1>`)
      .replace(/<style(?![^>]*\snonce=)([^>]*)>/g, `<style nonce="${nonce}"$1>`);
    body = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(injected));
        controller.close();
      },
    });
  } else {
    body = hasNoBody ? null : response.body;
  }

  const newResponse = new Response(body, response);
  // Content-Length is now stale because we injected nonces into the HTML.
  // Delete it so the runtime recompute or omits it.
  if (!hasNoBody && contentType.includes('text/html')) {
    newResponse.headers.delete('Content-Length');
  }

  newResponse.headers.set('X-Content-Type-Options', 'nosniff');
  newResponse.headers.set('X-Frame-Options', 'DENY');
  newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newResponse.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  newResponse.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()'
  );
  newResponse.headers.set('Cross-Origin-Opener-Policy', 'same-origin');

  // CSP with nonce instead of 'unsafe-inline'. Note: 'unsafe-inline' is ignored
  // by browsers when a nonce is present, but we remove it for clarity.
  const cspDirectives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    `style-src 'self' 'nonce-${nonce}'`,
    "font-src 'self' data:",
    "img-src 'self' blob: data:",
    "connect-src 'self'",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];
  newResponse.headers.set('Content-Security-Policy', cspDirectives.join('; '));

  return newResponse;
};
