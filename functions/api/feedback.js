/**
 * functions/api/feedback.js
 * Ingests user ratings and feedback messages
 */
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

export async function onRequestOptions({ request }) {
  const headers = getCorsHeaders(request);
  return new Response(null, { headers });
}

export async function onRequestPost({ request, env }) {
  const headers = getCorsHeaders(request);
  
  try {
    const payload = await request.json();
    const name = payload.name || 'Anonymous';
    const email = payload.email || '';
    const type = payload.type || 'Feedback';
    const message = payload.message || '';
    const rating = parseInt(payload.rating, 10) || null;

    if (!message) {
      return new Response(JSON.stringify({ error: "Feedback message cannot be empty." }), { headers, status: 400 });
    }

    // Insert into Cloudflare D1 SQL if bound
    if (env.DB) {
      await env.DB.prepare(
        `INSERT INTO feedback (name, email, type, message, rating)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(
        name,
        email,
        type,
        message,
        rating
      ).run();
    } else {
      console.log(`[Feedback Ingest] Name: ${name} | Rating: ${rating}⭐ | Message: ${message.substr(0, 50)}...`);
    }

    return new Response(JSON.stringify({ success: true, message: "Thank you for your valuable feedback!" }), { headers, status: 200 });
  } catch (error) {
    console.error("Feedback logging failed:", error);
    return new Response(JSON.stringify({ error: error.message }), { headers, status: 500 });
  }
}
