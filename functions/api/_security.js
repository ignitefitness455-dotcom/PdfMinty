// Allowed domains for CORS
export const ALLOWED_ORIGINS = [
  'https://pdfminty.com',
  'https://www.pdfminty.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8788'
];

/**
 * Validate and format CORS headers based on the Origin of the request.
 */
export function getCorsHeaders(request) {
  const origin = request.headers.get('Origin');
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

/**
 * Verify request origin to block unauthorized origins.
 */
export function isAllowedOrigin(request) {
  const origin = request.headers.get('Origin');
  if (origin) {
    return ALLOWED_ORIGINS.includes(origin);
  }
  return true; // Allow direct non-browser requests (e.g. CLI/Curl) if origin is missing.
}

/**
 * Stateless Rate Limiting using Cloudflare KV.
 * Falls back to in-memory Map during local development.
 */
const rateLimitMap = new Map();
const DEFAULT_WINDOW_MS = 60 * 1000;

export async function checkRateLimit(ip, env, maxRequests = 10, windowMs = DEFAULT_WINDOW_MS) {
  const now = Date.now();
  
  if (env && env.RATE_LIMIT_KV) {
    const windowStart = Math.floor(now / windowMs) * windowMs;
    const key = `rl:${ip}:${windowStart}`;
    
    let count = 0;
    const val = await env.RATE_LIMIT_KV.get(key);
    if (val) {
      count = parseInt(val, 10);
    }
    
    if (count >= maxRequests) {
      const nextWindow = windowStart + windowMs;
      const retryAfter = Math.ceil((nextWindow - now) / 1000);
      return { allowed: false, retryAfter };
    }
    
    await env.RATE_LIMIT_KV.put(key, (count + 1).toString(), { expirationTtl: Math.ceil(windowMs / 1000) });
    return { allowed: true };
  }
  
  // Local development / fallback in-memory Map
  for (const [key, value] of rateLimitMap.entries()) {
    if (now - value.startTime > windowMs) {
      rateLimitMap.delete(key);
    }
  }

  let record = rateLimitMap.get(ip);
  if (!record) {
    record = { count: 0, startTime: now };
    rateLimitMap.set(ip, record);
  }

  record.count += 1;

  if (record.count > maxRequests) {
    const retryAfter = Math.ceil((windowMs - (now - record.startTime)) / 1000);
    return { allowed: false, retryAfter };
  }

  return { allowed: true };
}

/**
 * Strips HTML tags completely.
 */
export function stripHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<\/?[^>]+(>|$)/g, '');
}

/**
 * Basic character escaping for XSS prevention.
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Robust sanitization function.
 */
export function sanitizeString(str) {
  return escapeHtml(stripHtml(str)).trim();
}

/**
 * Improved Prompt Injection Guard.
 */
export function checkPromptInjection(str) {
  if (typeof str !== 'string') return;

  const injectionPatterns = [
    /ignore[\s\-_]*previous/i,
    /bypass[\s\-_]*rules/i,
    /system[\s\-_]*prompt/i,
    /you[\s\-_]*are[\s\-_]*now/i,
    /override[\s\-_]*instructions/i,
    /forget[\s\-_]*everything/i,
    /acting[\s\-_]*as/i,
    /new[\s\-_]*role/i
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(str)) {
      throw new Error('Security Violation: Potential prompt injection detected.');
    }
  }
}
