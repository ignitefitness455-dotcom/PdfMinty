import { sanitizeString, isValidEmail } from "../utils/validation";
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

    // Identify Client IP
    const ip = request.headers.get("cf-connecting-ip") || "127.0.0.1";
    const ipKey = `rate_limit:contact:${ip}`;
    const limit = 3;
    const oneHourMs = 3600000;
    const nowMs = Date.now();

    // Check rate limit (entries with the same IP in the last hour)
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
        JSON.stringify({ success: false, error: "Rate limit exceeded. Too many requests from this IP in the last hour." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": corsOrigin,
          },
        }
      );
    }

    // Parse JSON body
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

    const { name: rawName, email: rawEmail, subject: rawSubject, message: rawMessage, timestamp } = payload;

    // Validate email syntax first using our secure regex function
    if (!rawEmail || typeof rawEmail !== "string" || !isValidEmail(rawEmail.trim())) {
      return new Response(
        JSON.stringify({ success: false, error: "A valid email address is required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": corsOrigin,
          },
        }
      );
    }

    // Sanitize values to prevent XSS before storage and usage
    const name = sanitizeString(rawName?.trim());
    const email = sanitizeString(rawEmail?.trim());
    const subject = sanitizeString(rawSubject?.trim());
    const message = sanitizeString(rawMessage?.trim());

    // Validate and check non-empty
    if (!name || name === "") {
      return new Response(
        JSON.stringify({ success: false, error: "Name is required and cannot be empty" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": corsOrigin,
          },
        }
      );
    }

    if (!subject || subject === "") {
      return new Response(
        JSON.stringify({ success: false, error: "Subject is required and cannot be empty" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": corsOrigin,
          },
        }
      );
    }

    if (!message || message === "") {
      return new Response(
        JSON.stringify({ success: false, error: "Message is required and cannot be empty" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": corsOrigin,
          },
        }
      );
    }

    // Update rate-limiting list
    timestamps.push(nowMs);
    await kv.put(ipKey, JSON.stringify(timestamps), { expirationTtl: 3600 });

    // Store in KV
    const cleanTimestamp = timestamp ? String(timestamp) : new Date().toISOString();
    const randomHex = crypto.randomUUID().substring(0, 6);
    const storageKey = `contact:${cleanTimestamp}:${randomHex}`;
    const storageValue = JSON.stringify({
      name,
      email,
      subject,
      message,
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
