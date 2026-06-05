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

    // Identify Client IP to prevent spamming reporting endpoint
    const ip = request.headers.get("cf-connecting-ip") || "127.0.0.1";
    const ipKey = `rate_limit_error:${ip}`;
    const limit = 20; // Allow up to 20 reports per hour to tolerate some rapid errors
    const oneHourMs = 3600000;
    const nowMs = Date.now();

    // Check rate limit
    const previousRequestsRaw = await kv.get(ipKey);
    let timestamps: number[] = [];
    if (previousRequestsRaw) {
      try {
        timestamps = JSON.parse(previousRequestsRaw);
      } catch (_) {}
    }

    const oneHourAgo = nowMs - oneHourMs;
    timestamps = timestamps.filter((t) => t > oneHourAgo);

    if (timestamps.length >= limit) {
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

    const { message, stack, timestamp, url } = payload;

    const cleanMessage = sanitizeString(message?.trim());
    const cleanStack = sanitizeString(stack?.trim());
    const cleanUrl = sanitizeString(url?.trim());

    // Update rate-limiting list
    timestamps.push(nowMs);
    await kv.put(ipKey, JSON.stringify(timestamps), { expirationTtl: 3600 });

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
