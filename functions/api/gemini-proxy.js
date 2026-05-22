/**
 * Advanced Input Sanitization
 * Replaces basic regex with strict HTML stripping and prompt injection guards.
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  
  const noHtml = str.replace(/<\/?[^>]+(>|$)/g, '');
  const escaped = noHtml
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
    if (pattern.test(escaped)) {
      throw new Error(`Security Violation: Potential prompt injection detected.`);
    }
  }

  return escaped;
};

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 10;

const checkRateLimit = (ip) => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now - value.startTime > RATE_LIMIT_WINDOW_MS) {
      rateLimitMap.delete(key);
    }
  }

  let record = rateLimitMap.get(ip);
  if (!record) {
    record = { count: 0, startTime: now };
    rateLimitMap.set(ip, record);
  }

  record.count += 1;

  if (record.count > MAX_REQUESTS) {
    const retryAfter = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - record.startTime)) / 1000);
    return { allowed: false, retryAfter };
  }

  return { allowed: true };
};

export async function onRequestOptions({ request }) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    }
  });
}

export async function onRequestPost({ request, env }) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  const clientIp = request.headers.get('cf-connecting-ip') || 'unknown';
  const rlResult = checkRateLimit(clientIp);
  
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
