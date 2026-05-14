/**
 * Advanced Input Sanitization
 * Replaces basic regex with strict HTML stripping and prompt injection guards.
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  
  // 1. Strip HTML tags entirely to prevent XSS
  const noHtml = str.replace(/<\/?[^>]+(>|$)/g, '');
  
  // 2. Escape Remaining Special Characters (basic encoder)
  const escaped = noHtml
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  // 3. Prompt Injection Defense (Basic Keyword Heuristics)
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

/**
 * Memory-based Rate Limiter using Map with TTL
 */
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 60 seconds
const MAX_REQUESTS = 10;

const checkRateLimit = (ip) => {
  const now = Date.now();
  
  // Auto-clean expired entries lazily
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
    // Calculate seconds remaining in the window
    const retryAfter = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - record.startTime)) / 1000);
    return { allowed: false, retryAfter };
  }

  return { allowed: true };
};

export const handler = async function (event) {
  // Determine allowed origin (allowing AI Studio preview domains while restricting generally)
  const origin = event.headers.origin || event.headers.Origin;
  let allowedOrigin = 'https://pdfminty.netlify.app';
  if (origin && (origin.includes('run.app') || origin.includes('localhost'))) {
    allowedOrigin = origin; // Support dev env
  }

  const headers = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  // Rate Limiting Check
  // Netlify event provides client IP via headers
  const clientIp = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';
  const rlResult = checkRateLimit(clientIp);
  
  if (!rlResult.allowed) {
    return {
      statusCode: 429,
      headers: {
        ...headers,
        'Retry-After': rlResult.retryAfter.toString()
      },
      body: JSON.stringify({ error: 'Too Many Requests', retryAfter: rlResult.retryAfter })
    };
  }

  try {
    // Environment Variable Security: Throw explicitly if missing
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Intentionally crashing or returning explicit 500
      throw new Error('Server Configuration Error: GEMINI_API_KEY environment variable is not set.');
    }

    if (!event.body) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Empty request' }) };
    }

    // Payload Size validation: Reject input over 15,000 characters with 413 error
    if (event.body.length > 15000) {
      return {
        statusCode: 413,
        headers,
        body: JSON.stringify({ error: 'Payload Too Large: Exceeds 15,000 characters limit.' })
      };
    }

    const payload = JSON.parse(event.body);
    let { prompt, context, history } = payload;

    prompt = prompt ? sanitizeString(prompt).substring(0, 500) : '';
    context = context ? sanitizeString(context).substring(0, 500) : '';

    // Ensure history is sanitized
    if (history && Array.isArray(history)) {
      history = history
        .map((h) => ({
          role: h.role,
          parts: h.parts.map((p) => ({ text: sanitizeString(p.text) })),
        }))
        .slice(0, 10);
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    // Construct the contents array with separated parts to mitigate prompt injection
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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Gemini proxy error:', error);
    
    // Distinguish between our validation errors and actual server failures
    if (error.message.includes('Security Violation')) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid input provided' }) };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'AI service unavailable' }),
    };
  }
};
