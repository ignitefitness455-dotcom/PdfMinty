interface Env {
  RATELIMIT_KV: KVNamespace;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request } = context;

  // Handle preflight OPTIONS request
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // Reject anything that is not POST
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method Not Allowed" }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          "Allow": "POST",
          "Access-Control-Allow-Origin": "*",
        },
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
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Identify Client IP
    const ip = request.headers.get("cf-connecting-ip") || "127.0.0.1";
    const ipKey = `rate_limit:${ip}`;
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
            "Access-Control-Allow-Origin": "*",
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
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const { rating, comment, email, timestamp } = payload;

    const parsedRating = Number(rating);
    if (!rating || isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return new Response(
        JSON.stringify({ success: false, error: "Rating must be a number between 1 and 5" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    if (!comment || typeof comment !== "string" || comment.trim() === "") {
      return new Response(
        JSON.stringify({ success: false, error: "Comment is required and cannot be empty" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Update rate-limiting list
    timestamps.push(nowMs);
    await kv.put(ipKey, JSON.stringify(timestamps), { expirationTtl: 3600 });

    // Store in KV
    const cleanTimestamp = timestamp ? String(timestamp) : new Date().toISOString();
    const randomHex = Math.random().toString(16).substring(2, 8).padEnd(6, "0");
    const storageKey = `feedback:${cleanTimestamp}:${randomHex}`;
    const storageValue = JSON.stringify({
      rating: parsedRating,
      comment,
      email: email || undefined,
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
          "Access-Control-Allow-Origin": "*",
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
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
};
