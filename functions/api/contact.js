import { corsHeaders, escapeHtml } from '../_utils.js';

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 5;

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
  const rlResult = checkRateLimit(clientIp);
  
  if (!rlResult.allowed) {
    headers['Retry-After'] = rlResult.retryAfter.toString();
    return new Response(JSON.stringify({ error: 'Too Many Requests', retryAfter: rlResult.retryAfter }), { status: 429, headers });
  }

  try {
    const data = await request.json();

    if (!data.name || !data.email || !data.message || !data.type) {
      return new Response(JSON.stringify({ error: "Missing required fields." }), { status: 400, headers });
    }

    const allowedTypes = ['feedback', 'support', 'bug', 'other'];
    if (!allowedTypes.includes(data.type)) {
      return new Response(JSON.stringify({ error: "Invalid type." }), { status: 400, headers });
    }

    const safeName = escapeHtml(data.name);
    const safeEmail = escapeHtml(data.email);
    const safeMessage = escapeHtml(data.message);
    const safeType = escapeHtml(data.type);

    console.log(`[Contact Form Submisison] Type: ${safeType} | Name: ${safeName} | Email: ${safeEmail} | Message: ${safeMessage.substring(0, 50)}...`);

    // If Resend API key is available via Cloudflare Pages Environment variables
    if (env.RESEND_API_KEY) {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Contact Form <noreply@pdfminty.com>', // MUST be verified in Resend domain settings
          to: 'contact@pdfminty.com', 
          subject: `[PdfMinty ${safeType}] Message from ${safeName}`,
          html: `
            <div style="font-family: sans-serif;">
              <h2>New ${safeType} Submission</h2>
              <p><strong>Name:</strong> ${safeName}</p>
              <p><strong>Email:</strong> ${safeEmail}</p>
              <br/>
              <p><strong>Message:</strong></p>
              <p style="white-space: pre-wrap; background: #f4f4f4; padding: 10px; border-radius: 5px;">${safeMessage}</p>
            </div>
          `,
        }),
      });

      if (!emailRes.ok) {
        const errObj = await emailRes.json();
        console.error("Resend API failed:", errObj);
        throw new Error("Email sending failed");
      }
    } else {
      console.log("No RESEND_API_KEY set up. Simulating successful form submission.");
    }
    
    // Always return success so the frontend UI can show the success dialog to the user smoothly
    return new Response(JSON.stringify({ success: true, message: "Thank you! Your message was received." }), {
      headers,
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || "Failed to submit" }), {
      headers,
      status: 500
    });
  }
}
