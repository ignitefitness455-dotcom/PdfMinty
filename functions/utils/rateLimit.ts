export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetSeconds: number;
}

/**
 * KV-backed sliding window rate limiter.
 * Tracks client IP requests within a sliding timeline window.
 */
export async function checkRateLimit(
  request: Request,
  env: any,
  endpoint: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const ip = request.headers.get("CF-Connecting-IP") || "local-ip";
  const key = `ratelimit:${endpoint}:${ip}`;

  // Dynamically resolve bound KV namespace (usually named PDFMINTY_KV or KV)
  const kv = env?.PDFMINTY_KV || env?.KV;

  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  if (!kv) {
    // Graceful in-memory fallback for local dev where KV is unbound
    if (!(globalThis as any)._rateLimitStore) {
      (globalThis as any)._rateLimitStore = new Map<string, number[]>();
    }
    const store = (globalThis as any)._rateLimitStore;
    let timestamps: number[] = store.get(key) || [];
    timestamps = timestamps.filter((t: number) => now - t < windowMs);

    if (timestamps.length >= limit) {
      const oldest = timestamps[0];
      const resetIn = Math.ceil((oldest + windowMs - now) / 1000);
      return { allowed: false, remaining: 0, limit, resetSeconds: Math.max(1, resetIn) };
    }

    timestamps.push(now);
    store.set(key, timestamps);
    const oldest = timestamps[0];
    const resetIn = Math.ceil((oldest + windowMs - now) / 1000);
    return {
      allowed: true,
      remaining: limit - timestamps.length,
      limit,
      resetSeconds: Math.max(1, resetIn),
    };
  }

  // Real KV storage sliding window processing
  let timestamps: number[] = [];
  try {
    const raw = await kv.get(key);
    if (raw) {
      timestamps = JSON.parse(raw);
    }
  } catch (err) {
    console.error(`KV Read Error for rate limiting client ${ip}:`, err);
  }

  // Prune any timestamps outside our active sliding window threshold
  timestamps = timestamps.filter((t: number) => now - t < windowMs);

  if (timestamps.length >= limit) {
    const oldest = timestamps[0];
    const resetIn = Math.ceil((oldest + windowMs - now) / 1000);
    return { allowed: false, remaining: 0, limit, resetSeconds: Math.max(1, resetIn) };
  }

  timestamps.push(now);

  try {
    // ExpirationTTL must be at least 60 seconds on CF KV
    const expirationTtl = Math.max(60, windowSeconds);
    await kv.put(key, JSON.stringify(timestamps), { expirationTtl });
  } catch (err) {
    console.error(`KV Write Error for rate limiting client ${ip}:`, err);
  }

  const oldest = timestamps[0];
  const resetIn = Math.ceil((oldest + windowMs - now) / 1000);
  return {
    allowed: true,
    remaining: limit - timestamps.length,
    limit,
    resetSeconds: Math.max(1, resetIn),
  };
}
