import { getCorsHeaders } from "./cors";

interface RateLimitEntry {
  count: number;
  timestamp: number;
}

// Global in-memory fallback map
const inMemoryFallback = new Map<string, RateLimitEntry>();

// Periodic cleanup every 5 minutes to prevent memory leaks / exhaustion
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of inMemoryFallback) {
      if (now - entry.timestamp > 10 * 60 * 1000) { // 10 minutes stale
        inMemoryFallback.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Checks rate limiting via atomic hourly blocks. Falls back to in-memory TTL map if KV is unavailable.
 */
export async function checkRateLimit(
  request: Request,
  kv: KVNamespace | undefined,
  endpoint: string,
  limit: number
): Promise<{ allowed: boolean; retryAfter: number; currentCount: number }> {
  const ip = request.headers.get("cf-connecting-ip") || "127.0.0.1";
  const now = Math.floor(Date.now() / 1000);
  const hourBlock = now - (now % 3600);
  const rateLimitKey = `rate_limit:${endpoint}:${ip}:${hourBlock}`;

  const retryAfter = 3600 - (now % 3600);

  // If KV is missing or can't be reached, fall-safe fallback to in-memory
  if (!kv) {
    const fallbackKey = `${endpoint}:${ip}`;
    const allowed = checkInMemoryFallback(fallbackKey, limit, 3600 * 1000);
    const entry = inMemoryFallback.get(fallbackKey);
    return {
      allowed,
      retryAfter,
      currentCount: entry ? entry.count : 0
    };
  }

  try {
    const countStr = await kv.get(rateLimitKey);
    const count = countStr ? parseInt(countStr, 10) : 0;

    if (count >= limit) {
      return { allowed: false, retryAfter, currentCount: count };
    }

    return { allowed: true, retryAfter, currentCount: count };
  } catch (err) {
    console.error(`KV rate limit lookup failed for ${rateLimitKey}, using in-memory fallback:`, err);
    const fallbackKey = `${endpoint}:${ip}`;
    const allowed = checkInMemoryFallback(fallbackKey, limit, 3600 * 1000);
    const entry = inMemoryFallback.get(fallbackKey);
    return {
      allowed,
      retryAfter,
      currentCount: entry ? entry.count : 0
    };
  }
}

/**
 * Increments the rate limit key. To be called AFTER all other validations succeed,
 * following the A2 pattern: "Increment ONLY after all validation passes"
 */
export async function incrementRateLimit(
  request: Request,
  kv: KVNamespace | undefined,
  endpoint: string,
  currentCount: number
): Promise<void> {
  const ip = request.headers.get("cf-connecting-ip") || "127.0.0.1";
  const now = Math.floor(Date.now() / 1000);
  const hourBlock = now - (now % 3600);
  const rateLimitKey = `rate_limit:${endpoint}:${ip}:${hourBlock}`;

  if (!kv) {
    // In-memory increment has already occurred during checkInMemoryFallback, so no-op
    return;
  }

  try {
    await kv.put(rateLimitKey, (currentCount + 1).toString(), { expirationTtl: 3600 });
  } catch (err) {
    console.error(`Failed to increment KV rate limit key ${rateLimitKey}`, err);
  }
}

function checkInMemoryFallback(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = inMemoryFallback.get(key);
  if (!entry) {
    inMemoryFallback.set(key, { count: 1, timestamp: now });
    return true;
  }
  if (now - entry.timestamp > windowMs) {
    inMemoryFallback.set(key, { count: 1, timestamp: now }); // Window expired, reset
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}
