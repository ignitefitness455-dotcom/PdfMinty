import { 
  sanitizeForStorage, 
  isValidUrl, 
  MAX_MESSAGE_LENGTH, 
  MAX_STACK_LENGTH, 
  MAX_URL_LENGTH 
} from "../utils/validation";
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
          // SECURITY FIX: Replaced inconsistent manual headers with getCorsHeaders to prevent leaks or bypasses
          headers: getCorsHeaders(corsOrigin),
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
          // SECURITY FIX: Avoid manual cors declarations. Standardize via getCorsHeaders
          headers: getCorsHeaders(corsOrigin),
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
          // SECURITY FIX: Standardize headers across all error responses
          headers: getCorsHeaders(corsOrigin),
        }
      );
    }

    // Validate payload is a valid object
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return new Response(
        JSON.stringify({ success: false, error: "Request body must be a valid JSON object." }),
        {
          status: 400,
          // SECURITY FIX: Avoid manual cors declarations. Standardize via getCorsHeaders
          headers: getCorsHeaders(corsOrigin),
        }
      );
    }

    await kv.put(rateLimitKey, (count + 1).toString(), { expirationTtl: 3600 });

    const { message, stack, timestamp, url } = payload;

    // SECURITY FIX: Switched from sanitizeString to sanitizeForStorage to stop HTML entity conversion before database ingestion
    const cleanMessage = sanitizeForStorage(message?.trim(), MAX_MESSAGE_LENGTH);
    
    // SECURITY FIX: Enforce size limit on stack parameter to avoid silent KV write failures or memory exhaustion
    const cleanStack = sanitizeForStorage(stack?.trim(), MAX_STACK_LENGTH);
    
    // SECURITY FIX: Resiliently validate url to ensure it holds a proper HTTP/HTTPS format, replacing with clean indicator if invalid
    const rawUrl = url?.trim() || "";
    const cleanUrl = sanitizeForStorage(rawUrl, MAX_URL_LENGTH);
    const validatedUrl = rawUrl !== "" && !isValidUrl(rawUrl) ? "[invalid url]" : cleanUrl;

    // SECURITY FIX: Generate keys completely server-side. Do not trust client timestamps which can pollute or corrupt KV namespaces
    const serverTimestamp = new Date().toISOString();
    const randomHex = crypto.randomUUID().substring(0, 8);
    const storageKey = `error:${serverTimestamp}:${randomHex}`;
    
    // SECURITY FIX: Limit client-supplied timestamp string parameter to avoid buffer bloating or injection
    const clientTimestamp = sanitizeForStorage(String(timestamp || ""), 50);

    const storageValue = JSON.stringify({
      message: cleanMessage,
      stack: cleanStack,
      url: validatedUrl,
      clientTimestamp,
      timestamp: serverTimestamp,
      ip,
    });

    await kv.put(storageKey, storageValue);

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        // SECURITY FIX: Direct unified header deployment via getCorsHeaders helper
        headers: getCorsHeaders(corsOrigin),
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || "An unexpected error occurred" }),
      {
        status: 500,
        // SECURITY FIX: Standardize catch block response headers
        headers: getCorsHeaders(corsOrigin),
      }
    );
  }
};
