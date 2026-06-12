/**
 * Helper to determine the configured safe CORS origin based on incoming Request Headers.
 * Validates against approved hostnames (localhost and pdfminty domains).
 *
 * @param request The incoming Request object.
 * @returns The resolved safe CORS origin string.
 */
export function getCorsOrigin(request: Request): string {
  const origin = request.headers.get("Origin") || "";
  const isLocal = origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:");
  const isProd = /^https:\/\/([a-z0-9-]+\.)?pdfminty\.(com|pages\.dev)$/.test(origin);

  return isLocal || isProd ? origin : "https://pdfminty.com";
}

/**
 * Validates whether the given origin is registered/allowed for strict operations.
 *
 * @param origin The origin URL string to test.
 * @returns True if the origin is allowed, false otherwise.
 */
export function isAllowedOrigin(origin: string): boolean {
  if (!origin) {
    return false;
  }
  const isLocal = origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:");
  const isProd = /^https:\/\/([a-z0-9-]+\.)?pdfminty\.(com|pages\.dev)$/.test(origin);
  return isLocal || isProd;
}

/**
 * Returns standard CORS headers configuration with configurable HTTP methods.
 *
 * @param origin The allowed CORS origin.
 * @param contentType The Content-Type header value. Defaults to "application/json".
 * @param methods Allowed HTTP methods. Defaults to "POST, GET, OPTIONS".
 * @returns An object representing the CORS response headers.
 */
export function getCorsHeaders(
  origin: string,
  contentType = "application/json",
  methods = "POST, GET, OPTIONS"
): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin || "https://pdfminty.com",
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": "Content-Type, Origin",
    "Access-Control-Max-Age": "86400",
    "Content-Type": contentType,
  };
}
