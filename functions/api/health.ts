import { getCorsOrigin, getCorsHeaders } from "../utils/cors";

interface Env {
  RATELIMIT_KV?: KVNamespace;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const corsOrigin = getCorsOrigin(request);

  if (request.method === "OPTIONS") {
    const headers = getCorsHeaders(corsOrigin);
    headers["Access-Control-Allow-Methods"] = "GET, OPTIONS";
    return new Response(null, { status: 204, headers });
  }

  if (request.method === "GET") {
    const checks: Record<string, string | boolean> = { kv: false };

    // KV binding present?
    if (!env.RATELIMIT_KV) {
      checks.kv = "binding_missing";
    } else {
      try {
        await env.RATELIMIT_KV.get("__health_probe__");
        checks.kv = true;
      } catch (_) {
        checks.kv = "unreachable";
      }
    }

    const allHealthy = checks.kv === true;

    return new Response(
      JSON.stringify({
        status: allHealthy ? "ok" : "degraded",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        checks,
      }),
      {
        status: allHealthy ? 200 : 503,
        headers: {
          ...getCorsHeaders(corsOrigin),
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  }

  return new Response(
    JSON.stringify({ success: false, error: "Method Not Allowed" }),
    { status: 405, headers: getCorsHeaders(corsOrigin) }
  );
};
