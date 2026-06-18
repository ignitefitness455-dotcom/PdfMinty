import { getCorsOrigin, getCorsHeaders } from "../utils/cors";
import { checkRateLimit, incrementRateLimit } from "../utils/rateLimit";
import {
  sanitizeForStorage,
  isValidUrl,
  MAX_URL_LENGTH,
  MAX_STACK_LENGTH,
  MAX_MESSAGE_LENGTH
} from "../utils/validation";
import { z } from "zod";

interface Env {
  RATELIMIT_KV: KVNamespace;
  PDFMINTY_KV?: KVNamespace;
}

const errorTelemetrySchema = z.object({
  message: z.string().trim().min(1, "Message is required").max(5000),
  url: z.string().trim().max(1000).optional(),
  stack: z.string().trim().max(5000).optional(),
  userAgent: z.string().trim().max(500).optional(),
});

export const onRequest: PagesFunction<Env> = async (context) => {
  const request = context.request;
  const corsOrigin = getCorsOrigin(request);

  // 1. OPTIONS preflight check
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: getCorsHeaders(corsOrigin) });
  }

  // 2. Reject wrong methods
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method Not Allowed" }), {
      status: 405, headers: getCorsHeaders(corsOrigin),
    });
  }

  // 3. Fail-closed if KV is missing for rate limiting & persistence
  const kv = context.env.RATELIMIT_KV || context.env.PDFMINTY_KV;
  if (!kv) {
    return new Response(JSON.stringify({ success: false, error: "Service Temporarily Unavailable" }), {
      status: 503, headers: getCorsHeaders(corsOrigin),
    });
  }

  // 4. Rate Limiting Check (20/hour, Atomic Hourly Block)
  const rateLimitResult = await checkRateLimit(request, kv, "error", 20);
  if (!rateLimitResult.allowed) {
    return new Response(JSON.stringify({ success: false, error: "Rate limit exceeded" }), {
      status: 429,
      headers: { ...getCorsHeaders(corsOrigin), "Retry-After": String(rateLimitResult.retryAfter) },
    });
  }

  // 5. Body Parsing and Validation (Size Limit 1MB)
  const contentLength = request.headers.get("Content-Length");
  if (contentLength && parseInt(contentLength) > 1 * 1024 * 1024) {
    return new Response(JSON.stringify({ success: false, error: "Payload too large" }), {
      status: 413, headers: getCorsHeaders(corsOrigin),
    });
  }

  let rawPayload: any;
  try {
    const text = await request.clone().text();
    if (!text.trim()) {
      rawPayload = {};
    } else {
      rawPayload = JSON.parse(text);
    }
  } catch {
    return new Response(JSON.stringify({ success: false, error: "Invalid JSON" }), {
      status: 400, headers: getCorsHeaders(corsOrigin),
    });
  }

  if (!rawPayload || typeof rawPayload !== "object" || Array.isArray(rawPayload)) {
    return new Response(JSON.stringify({ success: false, error: "Invalid request payload format" }), {
      status: 400, headers: getCorsHeaders(corsOrigin),
    });
  }

  // 6. Zod Parsing
  const parseResult = errorTelemetrySchema.safeParse(rawPayload);
  if (!parseResult.success) {
    const fields: Record<string, string> = {};
    for (const issue of parseResult.error.issues) {
      const fieldPath = issue.path.join(".") || "body";
      fields[fieldPath] = issue.message;
    }
    return new Response(JSON.stringify({ success: false, error: "VALIDATION_ERROR", fields }), {
      status: 400, headers: getCorsHeaders(corsOrigin),
    });
  }

  const data = parseResult.data;

  // 7. Sanitization & URL validation block
  const sanitizedMessage = sanitizeForStorage(data.message, MAX_MESSAGE_LENGTH);
  
  let sanitizedUrl = "";
  if (data.url) {
    const trimmedUrl = data.url.trim();
    if (isValidUrl(trimmedUrl) && trimmedUrl.length <= MAX_URL_LENGTH) {
      sanitizedUrl = trimmedUrl;
    } else {
      sanitizedUrl = "[invalid url]";
    }
  }

  const sanitizedStack = data.stack ? sanitizeForStorage(data.stack, MAX_STACK_LENGTH) : "";
  const sanitizedUserAgent = data.userAgent ? sanitizeForStorage(data.userAgent, 500) : "unknown";

  // 8. Server-Side Key Generation (never trust client timestamps)
  const serverTimestamp = new Date().toISOString();
  const randomHex = crypto.randomUUID().substring(0, 8);
  const storageKey = `telemetry:error:${serverTimestamp}:${randomHex}`;

  // 9. Save telemetry securely to KV with exactly 10 days TTL (10 * 24 * 60 * 60 seconds)
  try {
    await kv.put(
      storageKey,
      JSON.stringify({
        message: sanitizedMessage,
        url: sanitizedUrl,
        stack: sanitizedStack,
        userAgent: sanitizedUserAgent,
        ipHash: request.headers.get("cf-connecting-ip") || "127.0.0.1",
        createdAt: serverTimestamp,
      }),
      { expirationTtl: 10 * 24 * 60 * 60 }
    );
  } catch (err) {
    console.error("Failed to write telemetry error log to KV:", err);
    return new Response(JSON.stringify({ success: false, error: "Internal server storage error" }), {
      status: 500, headers: getCorsHeaders(corsOrigin),
    });
  }

  // 10. Rate limit increment ONLY on success
  await incrementRateLimit(request, kv, "error", rateLimitResult.currentCount);

  return new Response(
    JSON.stringify({ success: true, message: "Error logged securely." }),
    { status: 200, headers: getCorsHeaders(corsOrigin) }
  );
};
