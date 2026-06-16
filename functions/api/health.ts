import { handleCors, createPreflightResponse } from "../utils/cors";

interface HealthResponse {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  services: {
    kv: "healthy" | "unhealthy" | "not_bound";
    gemini_api: "healthy" | "unhealthy" | "timeout";
  };
}

export const onRequest: PagesFunction<any> = async (context) => {
  if (context.request.method === "OPTIONS") {
    return createPreflightResponse(context.request);
  }

  const responseHeaders = handleCors(context.request, new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
  }));

  const services: HealthResponse["services"] = {
    kv: "not_bound",
    gemini_api: "unhealthy",
  };

  let isHealthy = true;

  // 1. Check KV Connectivity
  const kv = context.env?.PDFMINTY_KV || context.env?.KV;
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
        isHealthy = false;
      }
    } catch (err) {
      console.error("Health check KV connection error:", err);
      services.kv = "unhealthy";
      isHealthy = false;
    }
  }

  // 2. Check Gemini Upstream reachability
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    // Make an unauthenticated model metadata check to authenticate DNS resolution and upstream reachability
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models?key=DUMMY_KEY_FOR_HEALTH_PROBE",
      {
        method: "GET",
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    // If Gemini responds with ANY HTTP code (like 400 due to bad key), it is reachability confirmed
    if (response.status === 400 || response.ok) {
      services.gemini_api = "healthy";
    } else {
      services.gemini_api = "unhealthy";
    }
  } catch (err: any) {
    if (err.name === "AbortError") {
      services.gemini_api = "timeout";
    } else {
      console.error("Health check Gemini reaching failed:", err);
      services.gemini_api = "unhealthy";
    }
  }

  const finalStatus: HealthResponse["status"] =
    services.kv === "healthy" && services.gemini_api === "healthy"
      ? "healthy"
      : services.kv === "unhealthy" || services.gemini_api === "unhealthy"
      ? "unhealthy"
      : "degraded";

  const statusCode = finalStatus === "unhealthy" ? 503 : 200;

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
