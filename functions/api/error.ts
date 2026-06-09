import { sanitizeString } from "../utils/validation";
import { getCorsOrigin, getCorsHeaders } from "../utils/cors";

interface Env {
  RATELIMIT_KV: KVNamespace;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request } = context;
  const corsOrigin = getCorsOrigin(request);

  // Handle preflight OPTIONS request
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(corsOrigin),
    });
  }

  // Reject anything that is not POST
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method Not Allowed" }),
      {
        status: 405,
        headers: getCorsHeaders(corsOrigin),
      }
    );
  }

  try {
    const kv = context.env.RATELIMIT_KV;
    if (!kv) {
      return new Response(
        JSON.stringify({ success: false, error: "RATELIMIT_KV namespace binding is missing or configure error" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": corsOrigin,
          },
        }
      );
    }

    // Identify Client IP to prevent spamming reporting endpoint and check hourly rate limit using an atomic counter
    const ip = request.headers.get("cf-connecting-ip") || "127.0.0.1";
    const now = Math.floor(Date.now() / 1000);
    const hourBlock = now - (now % 3600);
    const rateLimitKey = `rate_limit:error:${ip}:${hourBlock}`;
    const limit = 20;

    const countStr = await kv.get(rateLimitKey);
    const count = countStr ? parseInt(countStr, 10) : 0;

    if (count >= limit) {
      return new Response(
        JSON.stringify({ success: false, error: "Rate limit exceeded" }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": corsOrigin,
          },
        }
      );
    }

    // Parse the JSON body
    let payload: any;
    try {
      payload = await request.json();
    } catch (_) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON payload" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": corsOrigin,
          },
        }
      );
    }

    // BUG FIX: payload অবজেক্ট কিনা যাচাই করো
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return new Response(
        JSON.stringify({ success: false, error: "Request body must be a valid JSON object." }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": corsOrigin,
          },
        }
      );
    }

    await kv.put(rateLimitKey, (count + 1).toString(), { expirationTtl: 3600 });

    const { message, stack, timestamp, url } = payload;

    const cleanMessage = sanitizeString(message?.trim());
    const cleanStack = sanitizeString(stack?.trim());
    const cleanUrl = sanitizeString(url?.trim());

    // Store in KV
    const cleanTimestamp = timestamp ? String(timestamp) : new Date().toISOString();
    const randomHex = crypto.randomUUID().substring(0, 6);
    const storageKey = `error:${cleanTimestamp}:${randomHex}`;
    const storageValue = JSON.stringify({
      message: cleanMessage,
      stack: cleanStack,
      url: cleanUrl,
      timestamp: cleanTimestamp,
      ip,
    });

    await kv.put(storageKey, storageValue);

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": corsOrigin,
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || "An unexpected error occurred" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": corsOrigin,
        },
      }
    );
  }
};
