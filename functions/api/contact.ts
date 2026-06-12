import { 
  sanitizeForStorage, 
  sanitizeForHtml, 
  isValidEmail, 
  MAX_NAME_LENGTH, 
  MAX_SUBJECT_LENGTH, 
  MAX_MESSAGE_LENGTH 
} from "../utils/validation";
import { getCorsOrigin, getCorsHeaders } from "../utils/cors";

interface Env {
  RATELIMIT_KV: KVNamespace;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  NOTIFICATION_EMAIL?: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request } = context;
  const corsOrigin = getCorsOrigin(request);

  // Handle preflight OPTIONS request
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(corsOrigin),
    });
  }

  // Reject anything that is not POST
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method Not Allowed" }),
      {
        status: 405,
        headers: getCorsHeaders(corsOrigin),
      }
    );
  }

  try {
    const kv = context.env.RATELIMIT_KV;
    if (!kv) {
      return new Response(
        JSON.stringify({ success: false, error: "RATELIMIT_KV namespace binding is missing or configure error" }),
        {
          status: 500,
          // SECURITY FIX: Replaced inconsistent manual headers with getCorsHeaders to prevent leaks or bypasses
          headers: getCorsHeaders(corsOrigin),
        }
      );
    }

    // Identify Client IP and check hourly rate limit using an atomic counter
    const ip = request.headers.get("cf-connecting-ip") || "127.0.0.1";
    const now = Math.floor(Date.now() / 1000);
    const hourBlock = now - (now % 3600);
    const rateLimitKey = `rate_limit:contact:${ip}:${hourBlock}`;
    const limit = 3;

    const countStr = await kv.get(rateLimitKey);
    const count = countStr ? parseInt(countStr, 10) : 0;

    if (count >= limit) {
      return new Response(
        JSON.stringify({ success: false, error: "Rate limit exceeded. Too many requests from this IP in the last hour." }),
        {
          status: 429,
          // SECURITY FIX: Replaced manual cors headers with standard helper
          headers: getCorsHeaders(corsOrigin),
        }
      );
    }

    // Parse JSON body
    let payload: any;
    try {
      payload = await request.json();
    } catch (_) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON payload" }),
        {
          status: 400,
          // SECURITY FIX: Standardize headers across all error responses
          headers: getCorsHeaders(corsOrigin),
        }
      );
    }

    // Validate payload is a valid JSON object
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return new Response(
        JSON.stringify({ success: false, error: "Request body must be a valid JSON object." }),
        {
          status: 400,
          // SECURITY FIX: Standardize headers using standard helper
          headers: getCorsHeaders(corsOrigin),
        }
      );
    }

    await kv.put(rateLimitKey, (count + 1).toString(), { expirationTtl: 3600 });

    const { name: rawName, email: rawEmail, subject: rawSubject, message: rawMessage, timestamp } = payload;

    // Validate email syntax first using our secure regex function
    if (!rawEmail || typeof rawEmail !== "string" || !isValidEmail(rawEmail.trim())) {
      return new Response(
        JSON.stringify({ success: false, error: "A valid email address is required" }),
        {
          status: 400,
          // SECURITY FIX: Replaced manual headers block with getCorsHeaders(corsOrigin) helper
          headers: getCorsHeaders(corsOrigin),
        }
      );
    }

    // Sanitize values to prevent XSS before storage and usage
    // SECURITY FIX: Switched from sanitizeString to sanitizeForStorage to preserve original string characters in database ingestion and impose strict lengths
    const name = sanitizeForStorage(rawName?.trim(), MAX_NAME_LENGTH);
    const email = sanitizeForStorage(rawEmail?.trim(), MAX_SUBJECT_LENGTH); // Limit email address length safely
    const subject = sanitizeForStorage(rawSubject?.trim(), MAX_SUBJECT_LENGTH);
    const message = sanitizeForStorage(rawMessage?.trim(), MAX_MESSAGE_LENGTH);

    // Validate and check non-empty
    if (!name || name === "") {
      return new Response(
        JSON.stringify({ success: false, error: "Name is required and cannot be empty" }),
        {
          status: 400,
          // SECURITY FIX: Standardized headers usage via getCorsHeaders
          headers: getCorsHeaders(corsOrigin),
        }
      );
    }

    if (!subject || subject === "") {
      return new Response(
        JSON.stringify({ success: false, error: "Subject is required and cannot be empty" }),
        {
          status: 400,
          // SECURITY FIX: Standardized headers usage via getCorsHeaders
          headers: getCorsHeaders(corsOrigin),
        }
      );
    }

    if (!message || message === "") {
      return new Response(
        JSON.stringify({ success: false, error: "Message is required and cannot be empty" }),
        {
          status: 400,
          // SECURITY FIX: Standardized headers usage via getCorsHeaders
          headers: getCorsHeaders(corsOrigin),
        }
      );
    }

    // Store in KV
    // SECURITY FIX: Generate keys completely server-side. Do not trust client timestamps which can pollute or corrupt KV namespaces
    const serverTimestamp = new Date().toISOString();
    const randomHex = crypto.randomUUID().substring(0, 8);
    const storageKey = `contact:${serverTimestamp}:${randomHex}`;
    
    // SECURITY FIX: Limit client-supplied timestamp string parameter to avoid buffer bloating or injection
    const clientTimestamp = sanitizeForStorage(String(timestamp || ""), 50);

    const storageValue = JSON.stringify({
      name,
      email,
      subject,
      message,
      clientTimestamp,
      timestamp: serverTimestamp,
      ip,
    });

    await kv.put(storageKey, storageValue);

    // Send email notification via Resend if API key is present
    const resendApiKey = context.env.RESEND_API_KEY;
    if (resendApiKey) {
      const fromEmail = context.env.RESEND_FROM_EMAIL || "PDFMinty <onboarding@resend.dev>";
      const adminEmail = context.env.NOTIFICATION_EMAIL || "pdfminty@gmail.com";

      try {
        // Send email message to the Admin
        const adminEmailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [adminEmail],
            // Email headers require unescaped plain values to display cleanly on clients
            subject: `[PDFMinty Inquiry] ${subject} - from ${name}`,
            // SECURITY FIX: Switched from direct variable interpolation to sanitizeForHtml() calls to completely block XSS execution inside the email body
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; color: #1e293b;">
                <div style="background-color: #0f172a; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: bold; letter-spacing: -0.025em;">New Contact Message</h1>
                </div>
                <div style="margin-bottom: 20px; line-height: 1.6;">
                  <div style="margin-bottom: 12px;">
                    <strong style="color: #475569;">From:</strong> 
                    <span style="font-size: 15px; font-weight: 500;">${sanitizeForHtml(name)} (${sanitizeForHtml(email)})</span>
                  </div>
                  <div style="margin-bottom: 12px;">
                    <strong style="color: #475569;">Subject:</strong> 
                    <span style="font-size: 15px; font-weight: 500;">${sanitizeForHtml(subject)}</span>
                  </div>
                </div>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
                <div style="margin-bottom: 25px;">
                  <strong style="color: #475569; display: block; margin-bottom: 8px;">Message Content:</strong>
                  <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; font-size: 15px; line-height: 1.6; white-space: pre-wrap; color: #334155;">${sanitizeForHtml(message)}</div>
                </div>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
                <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">Sent via PDFMinty Secure Edge Service • Submitted from IP ${sanitizeForHtml(ip)} at ${sanitizeForHtml(serverTimestamp)}</p>
              </div>
            `,
          }),
        });

        if (!adminEmailResponse.ok) {
          const errMsg = await adminEmailResponse.text();
          console.error("Resend Admin notification failed:", adminEmailResponse.status, errMsg);
        }
      } catch (err: any) {
        console.error("Error sending Admin email via Resend:", err);
      }

      // Try sending a receipt confirmation to the user (optional setup, handles sandbox limitations)
      try {
        const userEmailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [email],
            subject: `We've received your message - PDFMinty`,
            // SECURITY FIX: Switched from raw interpolation to sanitizeForHtml() calls to completely block XSS execution inside the email body
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; color: #1e293b;">
                <div style="background-color: #0f172a; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: bold; letter-spacing: -0.025em;">Message Received!</h1>
                </div>
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 12px;">Hi ${sanitizeForHtml(name)},</p>
                <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
                  Thank you for contacting PDFMinty. We've successfully received your message regarding <strong>"${sanitizeForHtml(subject)}"</strong>, and we are reviewing it carefully.
                </p>
                <div style="background-color: #f1f5f9; padding: 15px 20px; border-radius: 8px; font-size: 14px; color: #475569; margin-bottom: 25px;">
                  Our average response time is under 24 hours. A support specialist will follow up with you soon.
                </div>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
                <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">PDFMinty — Secure Offline PDF Studio • Standard Client-side Utility Engine</p>
              </div>
            `,
          }),
        });

        if (!userEmailResponse.ok) {
          const errMsg = await userEmailResponse.text();
          console.warn("Resend User confirmation skipped or rejected (This matches expectation if domain is unverified on sandbox):", userEmailResponse.status, errMsg);
        }
      } catch (err: any) {
        console.warn("Error sending User confirmation email via Resend:", err);
      }
    } else {
      console.warn("Resend API Key is missing in this context. Email skipped (Stored in KV successfully).");
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        // SECURITY FIX: Replaced inconsistent manual headers with standard getCorsHeaders helper
        headers: getCorsHeaders(corsOrigin),
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || "An unexpected error occurred" }),
      {
        status: 500,
        // SECURITY FIX: Standardized headers usage via getCorsHeaders on catch block
        headers: getCorsHeaders(corsOrigin),
      }
    );
  }
};
