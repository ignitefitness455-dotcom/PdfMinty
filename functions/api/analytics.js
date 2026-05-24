/**
 * functions/api/analytics.js
 * Ingests anonymous telemetry events
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
  const country = request.headers.get('cf-ipcountry') || 'XX';
  
  try {
    const payload = await request.json();
    
    // Insert into Cloudflare D1 SQL if bound
    if (env.DB) {
      await env.DB.prepare(
        `INSERT INTO analytics (tool_id, session_hash, processing_time_ms, file_size_bytes, page_count, success, error_type, country_code, user_agent)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        payload.tool_id || null,
        payload.session_hash || null,
        payload.processing_time_ms || null,
        payload.file_size_bytes || null,
        payload.page_count || null,
        payload.success ? 1 : 0,
        payload.error_type || null,
        country,
        payload.user_agent || null
      ).run();
    } else {
      console.log(`[Analytics Telemetry] Tool: ${payload.tool_id} | Country: ${country} | ProcessingTime: ${payload.processing_time_ms}ms | Success: ${payload.success}`);
    }

    return new Response(JSON.stringify({ success: true }), { headers, status: 200 });
  } catch (error) {
    console.error("Analytics logging failed:", error);
    return new Response(JSON.stringify({ error: error.message }), { headers, status: 500 });
  }
}
