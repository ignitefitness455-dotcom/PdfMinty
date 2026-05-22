import {
  getCorsHeaders,
  isAllowedOrigin,
  checkRateLimit,
  sanitizeString
} from './_security.js';

export async function onRequestOptions({ request }) {
  const headers = getCorsHeaders(request);
  return new Response(null, { headers });
}

export async function onRequestPost({ request, env }) {
  if (!isAllowedOrigin(request)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const corsHeaders = getCorsHeaders(request);
  const headers = {
    ...corsHeaders,
    'Content-Type': 'application/json'
  };

  const clientIp = request.headers.get('cf-connecting-ip') || 'unknown';
  // Rate limit contact form to 3 submissions per minute per IP
  const rlResult = await checkRateLimit(clientIp, env, 3, 60000);
  
  if (!rlResult.allowed) {
    headers['Retry-After'] = rlResult.retryAfter.toString();
    return new Response(JSON.stringify({ error: 'Too Many Requests. Please try again later.', retryAfter: rlResult.retryAfter }), { status: 429, headers });
  }

  try {
    const data = await request.json();

    if (!data.name || !data.email || !data.message || !data.type) {
      return new Response(JSON.stringify({ error: "Missing required fields." }), { status: 400, headers });
    }

    const type = data.type.toLowerCase().trim();
    const name = data.name.trim();
    const email = data.email.trim();
    const message = data.message.trim();

    // Input Validation
    const allowedTypes = ['general', 'support', 'feedback', 'business'];
    if (!allowedTypes.includes(type)) {
      return new Response(JSON.stringify({ error: "Invalid submission type." }), { status: 400, headers });
    }

    if (name.length < 1 || name.length > 100) {
      return new Response(JSON.stringify({ error: "Name must be between 1 and 100 characters." }), { status: 400, headers });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.length > 150 || !emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email address format." }), { status: 400, headers });
    }

    if (message.length < 10 || message.length > 2000) {
      return new Response(JSON.stringify({ error: "Message must be between 10 and 2000 characters." }), { status: 400, headers });
    }

    // Input Sanitization for XSS protection
    const cleanType = sanitizeString(type);
    const cleanName = sanitizeString(name);
    const cleanEmail = sanitizeString(email);
    const cleanMessage = sanitizeString(message);

    console.log(`[Contact Form Submission] Type: ${cleanType} | Name: ${cleanName} | Email: ${cleanEmail}`);

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
          subject: `[PdfMinty ${cleanType}] Message from ${cleanName}`,
          html: `
            <div style="font-family: sans-serif;">
              <h2>New ${cleanType} Submission</h2>
              <p><strong>Name:</strong> ${cleanName}</p>
              <p><strong>Email:</strong> ${cleanEmail}</p>
              <br/>
              <p><strong>Message:</strong></p>
              <p style="white-space: pre-wrap; background: #f4f4f4; padding: 10px; border-radius: 5px;">${cleanMessage}</p>
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
    
    return new Response(JSON.stringify({ success: true, message: "Thank you! Your message was received." }), {
      headers,
      status: 200
    });
  } catch (error) {
    console.error("Contact Form Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Failed to submit" }), {
      headers,
      status: 500
    });
  }
}
