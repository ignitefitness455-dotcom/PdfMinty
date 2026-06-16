export function checkOrigin(origin: string | null): boolean {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    // Allow production production/testing domains
    if (url.hostname === "pdfminty.com" || url.hostname === "www.pdfminty.com") {
      return true;
    }
    // Allow localhost development domains on any port
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      return true;
    }
  } catch {
    // Ignore invalid origins
  }
  return false;
}

export function handleCors(request: Request, responseHeaders: Headers = new Headers()): Headers {
  const origin = request.headers.get("Origin");
  if (checkOrigin(origin)) {
    responseHeaders.set("Access-Control-Allow-Origin", origin!);
    responseHeaders.set("Access-Control-Allow-Credentials", "true");
  } else {
    // strict default if no match: do not expose wildcard
    responseHeaders.set("Access-Control-Allow-Origin", "https://pdfminty.com");
  }
  
  responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD, PUT");
  responseHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Origin, Accept");
  responseHeaders.set("Access-Control-Max-Age", "86400"); // 24 hours cache for preflight checks
  return responseHeaders;
}

export function createPreflightResponse(request: Request): Response {
  const headers = handleCors(request, new Headers());
  return new Response(null, {
    status: 204,
    headers,
  });
}
