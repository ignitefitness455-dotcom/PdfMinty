import { getCorsOrigin, getCorsHeaders } from "../utils/cors";

interface HealthResponse {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  services: {
    kv: "healthy" | "unhealthy" | "not_bound";
    gemini_api: "healthy" | "unhealthy" | "timeout";
  };
}

interface Env {
  RATELIMIT_KV: KVNamespace;
  PDFMINTY_KV?: KVNamespace;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const request = context.request;
  const corsOrigin = getCorsOrigin(request);

  // OPTIONS preflight check
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: getCorsHeaders(corsOrigin) });
  }

  // Reject wrong methods (accept GET/HEAD for healthcheck)
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response(JSON.stringify({ success: false, error: "Method Not Allowed" }), {
      status: 405, headers: getCorsHeaders(corsOrigin),
    });
  }

  const services: HealthResponse["services"] = {
    kv: "not_bound",
    gemini_api: "unhealthy",
  };

  // 1. Check KV Connectivity (fail-closed if not healthy)
  const kv = context.env.RATELIMIT_KV || context.env.PDFMINTY_KV;
  if (kv) {
    try {
      const testKey = "healthcheck:probe";
      const testValue = Date.now().toString();
      await kv.put(testKey, testValue, { expirationTtl: 60 });
      const readVal = await kv.get(testKey);
      if (readVal === testValue) {
        services.kv = "healthy";
      } else {
        services.kv = "unhealthy";
      }
    } catch (err) {
      console.error("Health check KV connection error:", err);
      services.kv = "unhealthy";
    }
  }

  // 2. Check Gemini Upstream reachability (2.5s timeout)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    // Make an unauthenticated model metadata check to verify DNS resolution and upstream reachability
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models?key=DUMMY_KEY_FOR_HEALTH_PROBE",
      {
        method: "GET",
        signal: controller.signal,
      }
    );

    // If Gemini responds with ANY HTTP code (like 400 due to bad key), it is reachability confirmed
    if (response.status === 400 || response.ok) {
      services.gemini_api = "healthy";
    } else {
      services.gemini_api = "unhealthy";
    }
  } catch (err: any) {
    if (err.name === "AbortError" || err.message?.includes("abort")) {
      services.gemini_api = "timeout";
    } else {
      console.error("Health check Gemini reaching failed:", err);
      services.gemini_api = "unhealthy";
    }
  } finally {
    // CRITICAL: clearTimeout MUST be in finally block to prevent resource leaks
    clearTimeout(timeoutId);
  }

  // Degraded if KV is missing (not bound), Unhealthy if either KV or Gemini is offline
  const finalStatus: HealthResponse["status"] =
    services.kv === "healthy" && services.gemini_api === "healthy"
      ? "healthy"
      : services.kv === "unhealthy" || services.gemini_api === "unhealthy"
      ? "unhealthy"
      : "degraded";

  const statusCode = finalStatus === "unhealthy" ? 503 : 200;

  const responseHeaders = {
    ...getCorsHeaders(corsOrigin),
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  };

  return new Response(
    JSON.stringify({
      status: finalStatus,
      timestamp: new Date().toISOString(),
      services,
    } as HealthResponse),
    {
      status: statusCode,
      headers: responseHeaders,
    }
  );
};
