/**
 * Advanced Input Sanitization
 * Replaces basic regex with strict HTML stripping and prompt injection guards.
 */
import { corsHeaders } from '../_utils.js';

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
    /you are now/i,
    /forget everything/i,
    /disregard previous/i,
    /new instructions/i,
    /developer mode/i,
    /act as/i,
    /pretend to be/i,
    /simulate/i,
    /override/i,
    /jailbreak/i,
    /do not follow/i,
    /ignore all/i,
    /print your instructions/i,
    /reveal your instructions/i,
    /what are your instructions/i
  ];
  
  for (const pattern of injectionPatterns) {
    if (pattern.test(escaped)) {
      throw new Error(`Security Violation: Potential prompt injection detected.`);
    }
  }

  return escaped;
};

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 10;

// Requires Cloudflare KV binding named RATE_LIMIT_KV in dashboard
const checkRateLimit = async (ip, env) => {
  if (!env.RATE_LIMIT_KV) {
    console.warn('RATE_LIMIT_KV binding missing, skipping rate limit');
    return { allowed: true };
  }
  
  const now = Date.now();
  const key = `rl_${ip}`;
  
  let recordStr = await env.RATE_LIMIT_KV.get(key);
  let record = recordStr ? JSON.parse(recordStr) : { count: 0, startTime: now };
  
  if (now - record.startTime > RATE_LIMIT_WINDOW_MS) {
    record = { count: 0, startTime: now };
  }
  
  record.count += 1;
  
  if (record.count > MAX_REQUESTS) {
    const retryAfter = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - record.startTime)) / 1000);
    return { allowed: false, retryAfter };
  }
  
  await env.RATE_LIMIT_KV.put(key, JSON.stringify(record), { expirationTtl: 60 });
  return { allowed: true };
};

export async function onRequestOptions({ request }) {
  const headers = corsHeaders(request);
  const origin = request.headers.get('Origin');
  const allowedOrigins = ['https://pdfminty.com', 'https://www.pdfminty.com'];
  if (origin && !allowedOrigins.includes(origin)) {
    return new Response(null, { status: 403 });
  }
  return new Response(null, { headers });
}

export async function onRequestPost({ request, env }) {
  const headers = corsHeaders(request);
  headers['Content-Type'] = 'application/json';
  
  const origin = request.headers.get('Origin');
  const allowedOrigins = ['https://pdfminty.com', 'https://www.pdfminty.com'];
  if (origin && !allowedOrigins.includes(origin)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers });
  }

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
      system_instruction: {
        parts: [{ text: "You are a helpful AI assistant for PdfMinty, a PDF manipulation tool. Answer questions related to PDF processing." }]
      },
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
