/**
 * Advanced Input Sanitization
 * Replaces basic regex with strict HTML stripping and prompt injection guards.
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  
  const noHtml = str.replace(/<\/?[^>]+(>|$)/g, '');
  const exam = noHtml
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const injectionPatterns = [
    /ignore previous/i,
    /bypass rules/i,
    /system prompt/i,
    /you are now/i
  ];
  
  for (const pattern of injectionPatterns) {
    if (pattern.test(exam)) {
      throw new Error(`Security Violation: Potential prompt injection detected.`);
    }
  }

  return exam;
};

const getCorsHeaders = (request) => {
  const allowedOrigins = [
    'https://pdfminty.com',
    'https://www.pdfminty.com'
  ];
  const origin = request.headers.get('Origin');
  let allowedOrigin = 'https://pdfminty.com';

  if (origin) {
    const isLocalhost = /^https?:\/\/localhost(:\d+)?$/.test(origin);
    const isCloudRun = origin.endsWith('.run.app');
    const isAllowedCustom = allowedOrigins.includes(origin);

    if (isLocalhost || isCloudRun || isAllowedCustom) {
      allowedOrigin = origin;
    }
  }

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
  };
};

const checkRateLimit = async (ip, env) => {
  const kv = env.RATE_LIMIT_KV || env.KV || env.pdfminty;
  const MAX_REQUESTS = 10;
  const now = Date.now();
  const windowBucket = Math.floor(now / 60000);
  const key = `ratelimit:${ip}:${windowBucket}`;

  if (!kv) {
    console.warn('Cloudflare KV namespace not bound. Falling back to local/in-memory rate limiting.');
    if (!globalThis.rateLimitMap) {
      globalThis.rateLimitMap = new Map();
    }
    const map = globalThis.rateLimitMap;
    const cacheKey = `${ip}:${windowBucket}`;
    
    // Auto clean simple cleanup
    for (const k of map.keys()) {
      const parts = k.split(':');
      if (parts[1] && parseInt(parts[1]) !== windowBucket) {
        map.delete(k);
      }
    }

    const current = map.get(cacheKey) || 0;
    if (current >= MAX_REQUESTS) {
      const retryAfter = Math.ceil((60000 - (now % 60000)) / 1000);
      return { allowed: false, retryAfter };
    }
    map.set(cacheKey, current + 1);
    return { allowed: true };
  }

  try {
    const value = await kv.get(key);
    let currentCount = value ? parseInt(value, 10) || 0 : 0;

    if (currentCount >= MAX_REQUESTS) {
      const retryAfter = Math.ceil((60000 - (now % 60000)) / 1000);
      return { allowed: false, retryAfter };
    }

    await kv.put(key, (currentCount + 1).toString(), { expirationTtl: 120 });
    return { allowed: true };
  } catch (err) {
    console.error('Rate limiting KV store error:', err);
    return { allowed: true };
  }
};

export async function onRequestOptions({ request }) {
  const headers = getCorsHeaders(request);
  return new Response(null, { headers });
}

export async function onRequestPost({ request, env }) {
  const headers = getCorsHeaders(request);
  const clientIp = request.headers.get('cf-connecting-ip') || 'unknown';
  
  const rlResult = await checkRateLimit(clientIp, env);
  
  if (!rlResult.allowed) {
    headers['Retry-After'] = rlResult.retryAfter.toString();
    return new Response(JSON.stringify({ error: 'Too Many Requests', retryAfter: rlResult.retryAfter }), { status: 429, headers });
  }

  try {
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Server Configuration Error: GEMINI_API_KEY environment variable is not set.');
    }

    const bodyText = await request.text();
    if (!bodyText) {
      return new Response(JSON.stringify({ error: 'Empty request' }), { status: 400, headers });
    }

    if (bodyText.length > 15000) {
      return new Response(JSON.stringify({ error: 'Payload Too Large: Exceeds 15,000 characters limit.' }), { status: 413, headers });
    }

    const payload = JSON.parse(bodyText);
    let { prompt, context, history } = payload;

    prompt = prompt ? sanitizeString(prompt).substring(0, 500) : '';
    context = context ? sanitizeString(context).substring(0, 500) : '';

    if (history && Array.isArray(history)) {
      history = history
        .map((h) => ({
          role: h.role,
          parts: h.parts.map((p) => ({ text: sanitizeString(p.text) })),
        }))
        .slice(0, 10);
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const parts = [];
    if (context) parts.push({ text: `Context: ${context}` });
    if (history) parts.push({ text: `History: ${JSON.stringify(history)}` });
    if (prompt) parts.push({ text: `Prompt: ${prompt}` });

    const fetchBody = {
      contents: [
        {
          parts: parts,
        },
      ],
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fetchBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error details:', JSON.stringify(data, null, 2));
      throw new Error(`AI service unavailable: ${data?.error?.message || 'Unknown API error'}`);
    }

    return new Response(JSON.stringify(data), { status: 200, headers });

  } catch (error) {
    console.error('Gemini proxy error:', error);
    
    if (error.message.includes('Security Violation')) {
      return new Response(JSON.stringify({ error: 'Invalid input provided' }), { status: 400, headers });
    }

    return new Response(JSON.stringify({ error: 'AI service unavailable' }), { status: 500, headers });
  }
}
