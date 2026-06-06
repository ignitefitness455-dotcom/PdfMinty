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
    const checks: Record<string, boolean> = { kv: false };

    try {
      if (env.RATELIMIT_KV) {
        await env.RATELIMIT_KV.get("__health_probe__");
        checks.kv = true;
      }
    } catch (_) {
      checks.kv = false;
    }

    const allHealthy = Object.values(checks).every(Boolean);

    return new Response(
      JSON.stringify({
        status: allHealthy ? "ok" : "degraded",
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
