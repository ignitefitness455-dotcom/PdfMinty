import { getCorsOrigin, getCorsHeaders } from '../utils/cors';
import { MAX_STACK_LENGTH } from '../utils/validation';

interface Env {
  RATELIMIT_KV?: KVNamespace;
}

interface ClientErrorPayload {
  message?: unknown;
  stack?: unknown;
  timestamp?: unknown;
  url?: unknown;
}

const MAX_MESSAGE_LENGTH = 2000;
const MAX_URL_LENGTH = 500;
const MAX_BODY_BYTES = 16 * 1024; // 16 KB hard cap on request body
const RATE_LIMIT_PER_HOUR = 30;

/**
 * Strip CR/LF from a string to prevent log-injection (attacker crafting a
 * `message` with embedded newlines that forge fake log lines).
 */
function stripNewlines(s: string): string {
  return s.replace(/[\r\n]+/g, ' ');
}

/**
 * Convert an unknown payload field to a length-capped, newline-stripped string.
 */
function sanitize(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') {
    if (value === null || value === undefined) return '';
    try {
      value = JSON.stringify(value);
    } catch {
      return '';
    }
  }
  const truncated = value.length > maxLen ? value.slice(0, maxLen) : value;
  return stripNewlines(truncated);
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const origin = getCorsOrigin(request);
  const corsHeaders = getCorsHeaders(origin);

  // Preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders as HeadersInit,
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed. Use POST.' }), {
      status: 405,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        Allow: 'POST, OPTIONS',
      } as HeadersInit,
    });
  }

  // Body size guard — reject oversized payloads before parsing.
  const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
  if (contentLength > MAX_BODY_BYTES) {
    return new Response(null, { status: 413, headers: corsHeaders as HeadersInit });
  }

  // Rate limit (same KV-based pattern as contact/feedback).
  const ip = request.headers.get('cf-connecting-ip') || 'unknown-ip';
  const hourBlock = Math.floor(Date.now() / 3600000);
  const rateLimitKey = `rate_limit:error:${ip}:${hourBlock}`;

  if (env.RATELIMIT_KV) {
    try {
      const currentCountStr = await env.RATELIMIT_KV.get(rateLimitKey);
      const currentCount = currentCountStr ? parseInt(currentCountStr, 10) : 0;
      if (currentCount >= RATE_LIMIT_PER_HOUR) {
        return new Response(null, { status: 429, headers: corsHeaders as HeadersInit });
      }
      await env.RATELIMIT_KV.put(rateLimitKey, (currentCount + 1).toString(), {
        expirationTtl: 3600,
      });
    } catch (kvErr) {
      // Best-effort: continue ingestion but log the KV failure.
      console.error('KV rate limit check failed:', kvErr);
    }
  }

  try {
    const rawText = await request.text();
    if (rawText.length > MAX_BODY_BYTES) {
      return new Response(null, { status: 413, headers: corsHeaders as HeadersInit });
    }

    let data: ClientErrorPayload;
    try {
      data = JSON.parse(rawText) as ClientErrorPayload;
    } catch {
      return new Response(null, { status: 204, headers: corsHeaders as HeadersInit });
    }

    const cleanMessage = sanitize(data.message, MAX_MESSAGE_LENGTH);
    const cleanStack = sanitize(data.stack, MAX_STACK_LENGTH);
    const cleanUrl = sanitize(data.url, MAX_URL_LENGTH);
    const cleanTimestamp = sanitize(
      data.timestamp || new Date().toISOString(),
      50
    );

    // Structured JSON log — no free-text interpolation, no injection surface.
    console.error(
      JSON.stringify({
        type: 'client-error',
        timestamp: cleanTimestamp,
        url: cleanUrl,
        message: cleanMessage,
        stack: cleanStack,
      })
    );
  } catch (err) {
    // Never leak internal errors. Always return 204.
    console.error('Error ingestion service failure:', err);
  }

  return new Response(null, {
    status: 204,
    headers: corsHeaders as HeadersInit,
  });
};
