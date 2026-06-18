/**
 * Resolve safe CORS origin from request headers.
 * Validates against approved hostnames (localhost, pdfminty domains, pages.dev, and run.app for dev).
 */
export function getCorsOrigin(request: Request): string {
  const origin = request.headers.get("Origin") || "";
  const isLocal = origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:");
  const isProd = /^https:\/\/([a-z0-9-]+\.)?pdfminty\.(com|pages\.dev)$/.test(origin) || origin.endsWith(".run.app") || origin.endsWith(".pages.dev");
  return isLocal || isProd ? origin : "https://pdfminty.com";
}

/** Validate origin for strict operations (e.g., Gemini proxy). */
export function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false;
  const isLocal = origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:");
  const isProd = /^https:\/\/([a-z0-9-]+\.)?pdfminty\.(com|pages\.dev)$/.test(origin) || origin.endsWith(".run.app") || origin.endsWith(".pages.dev");
  return isLocal || isProd;
}

/** Standard CORS headers with configurable methods. */
export function getCorsHeaders(
  origin: string,
  contentType = "application/json",
  methods = "POST, GET, OPTIONS, HEAD, PUT"
): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin || "https://pdfminty.com",
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": "Content-Type, Origin, Authorization, X-Requested-With, Accept",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
    "Content-Type": contentType,
  };
}

// Deprecated alias kept for backwards compatibility with any existing middleware
export function checkOrigin(origin: string | null): boolean {
  return isAllowedOrigin(origin || "");
}

// Deprecated alias kept for backwards compatibility
export function handleCors(request: Request, responseHeaders: Headers = new Headers()): Headers {
  const origin = getCorsOrigin(request);
  responseHeaders.set("Access-Control-Allow-Origin", origin);
  responseHeaders.set("Access-Control-Allow-Credentials", "true");
  responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD, PUT");
  responseHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Origin, Accept");
  responseHeaders.set("Access-Control-Max-Age", "86400");
  return responseHeaders;
}

// Deprecated alias kept for backwards compatibility
export function createPreflightResponse(request: Request): Response {
  const origin = getCorsOrigin(request);
  const headers = getCorsHeaders(origin);
  const headersObj = new Headers();
  for (const [key, val] of Object.entries(headers)) {
    headersObj.set(key, val);
  }
  return new Response(null, {
    status: 204,
    headers: headersObj,
  });
}
