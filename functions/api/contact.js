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
  const MAX_REQUESTS = 5; // Secure rate limit for message submissions
  const now = Date.now();
  const windowBucket = Math.floor(now / 60000);
  const key = `ratelimit_contact:${ip}:${windowBucket}`;

  if (!kv) {
    console.warn('Cloudflare KV namespace not bound. Falling back to local in-memory rate limiting.');
    if (!globalThis.contactRateLimitMap) {
      globalThis.contactRateLimitMap = new Map();
    }
    const map = globalThis.contactRateLimitMap;
    const cacheKey = `${ip}:${windowBucket}`;
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

const sanitizeAndValidate = (data) => {
  if (!data) throw new Error("No payload provided.");
  
  const required = ['name', 'email', 'message', 'type'];
  for (const field of required) {
    if (!data[field] || typeof data[field] !== 'string') {
      throw new Error(`Invalid or missing field: ${field}.`);
    }
  }
  
  const name = data.name.trim();
  const email = data.email.trim();
  const type = data.type.trim();
  const message = data.message.trim();
  
  if (name.length < 2 || name.length > 100) {
    throw new Error("Name must be between 2 and 100 characters.");
  }
  if (message.length < 10 || message.length > 5000) {
    throw new Error("Message must be between 10 and 5000 characters.");
  }
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email) || email.length > 150) {
    throw new Error("Invalid email format.");
  }
  
  const allowedTypes = ['General Inquiry', 'Feedback', 'Bug Report', 'Business'];
  if (!allowedTypes.includes(type)) {
    throw new Error("Invalid topic selected.");
  }
  
  const cleanStr = (str) => {
    return str
      .replace(/<\/?[^>]+(>|$)/g, '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };
  
  return {
    name: cleanStr(name),
    email: cleanStr(email),
    type: cleanStr(type),
    message: cleanStr(message)
  };
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
    const rawData = await request.json();
    const data = sanitizeAndValidate(rawData);

    console.log(`[Contact Form Submission] Type: ${data.type} | Name: ${data.name} | Email: ${data.email} | Message: ${data.message.substring(0, 50)}...`);

    if (env.RESEND_API_KEY) {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Contact Form <noreply@pdfminty.com>',
          to: 'contact@pdfminty.com', 
          subject: `[PdfMinty ${data.type}] Message from ${data.name}`,
          html: `
            <div style="font-family: sans-serif;">
              <h2>New ${data.type} Submission</h2>
              <p><strong>Name:</strong> ${data.name}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              <br/>
              <p><strong>Message:</strong></p>
              <p style="white-space: pre-wrap; background: #f4f4f4; padding: 10px; border-radius: 5px;">${data.message}</p>
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
    console.error("Contact Form handling error:", error);
    return new Response(JSON.stringify({ error: error.message || "Failed to submit" }), {
      headers,
      status: error.message.includes('Invalid') || error.message.includes('required') || error.message.includes('between') ? 400 : 500
    });
  }
}
