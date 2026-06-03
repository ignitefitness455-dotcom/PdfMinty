/**
 * Helper to determine the configured safe CORS origin based on incoming Request Headers.
 * Validates against approved hostnames (localhost and pdfminty domains).
 */
export function getCorsOrigin(request: Request): string {
  const origin = request.headers.get("Origin") || "";
  const isLocal = origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:");
  const isProd = /^https:\/\/([a-z0-9-]+\.)?pdfminty\.(com|pages\.dev)$/.test(origin);

  return isLocal || isProd ? origin : "https://www.pdfminty.com";
}

/**
 * Validates whether the given origin is registered/allowed for strict operations.
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
 * Returns standard CORS headers configuration.
 */
export function getCorsHeaders(origin: string, contentType = "application/json"): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin || "https://www.pdfminty.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Origin",
    "Access-Control-Max-Age": "86400",
    "Content-Type": contentType,
  };
}
