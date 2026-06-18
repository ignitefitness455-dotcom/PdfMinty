import { getCorsOrigin, getCorsHeaders } from "../utils/cors";
import { detectSpamHeuristics } from "../utils/spam";
import { checkRateLimit, incrementRateLimit } from "../utils/rateLimit";
import {
  sanitizeForStorage,
  sanitizeForHtml,
  isValidEmail,
  MAX_NAME_LENGTH,
  MAX_SUBJECT_LENGTH,
  MAX_MESSAGE_LENGTH
} from "../utils/validation";
import { z } from "zod";

interface Env {
  RATELIMIT_KV: KVNamespace;
  PDFMINTY_KV?: KVNamespace;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  NOTIFICATION_EMAIL?: string;
}

// DO NOT include website or honeypot in the Zod schema directly
const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address"),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  message: z.string().trim().min(5, "Message must be at least 5 characters").max(5000),
});

export const onRequest: PagesFunction<Env> = async (context) => {
  const request = context.request;
  const corsOrigin = getCorsOrigin(request);

  // 1. OPTIONS preflight check
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: getCorsHeaders(corsOrigin) });
  }

  // 2. Reject wrong methods
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method Not Allowed" }), {
      status: 405, headers: getCorsHeaders(corsOrigin),
    });
  }

  // 3. Fail-closed if KV is missing for rate limiting & persistence
  const kv = context.env.RATELIMIT_KV || context.env.PDFMINTY_KV;
  if (!kv) {
    return new Response(JSON.stringify({ success: false, error: "Service Temporarily Unavailable" }), {
      status: 503, headers: getCorsHeaders(corsOrigin),
    });
  }

  // 4. Rate Limiting Check (3/hour, Atomic Hourly Block)
  const rateLimitResult = await checkRateLimit(request, kv, "contact", 3);
  if (!rateLimitResult.allowed) {
    return new Response(JSON.stringify({ success: false, error: "Rate limit exceeded" }), {
      status: 429,
      headers: { ...getCorsHeaders(corsOrigin), "Retry-After": String(rateLimitResult.retryAfter) },
    });
  }

  // 5. Body Parsing and Validation (Size Limit 1MB)
  const contentLength = request.headers.get("Content-Length");
  if (contentLength && parseInt(contentLength) > 1 * 1024 * 1024) {
    return new Response(JSON.stringify({ success: false, error: "Payload too large" }), {
      status: 413, headers: getCorsHeaders(corsOrigin),
    });
  }

  let rawPayload: any;
  try {
    const text = await request.clone().text();
    if (!text.trim()) {
      rawPayload = {};
    } else {
      rawPayload = JSON.parse(text);
    }
  } catch {
    return new Response(JSON.stringify({ success: false, error: "Invalid JSON" }), {
      status: 400, headers: getCorsHeaders(corsOrigin),
    });
  }

  if (!rawPayload || typeof rawPayload !== "object" || Array.isArray(rawPayload)) {
    return new Response(JSON.stringify({ success: false, error: "Invalid request payload format" }), {
      status: 400, headers: getCorsHeaders(corsOrigin),
    });
  }

  // 6. Manual Honeypot validation (done BEFORE incrementing rate limits, checked manually)
  if (
    (rawPayload.website !== undefined && String(rawPayload.website).trim().length > 0) ||
    (rawPayload.honeypot !== undefined && String(rawPayload.honeypot).trim().length > 0)
  ) {
    return new Response(JSON.stringify({ success: false, error: "Spam detected" }), {
      status: 400, headers: getCorsHeaders(corsOrigin),
    });
  }

  // 7. Zod Parsing
  const parseResult = contactSchema.safeParse(rawPayload);
  if (!parseResult.success) {
    const fields: Record<string, string> = {};
    for (const issue of parseResult.error.issues) {
      const fieldPath = issue.path.join(".") || "body";
      fields[fieldPath] = issue.message;
    }
    return new Response(JSON.stringify({ success: false, error: "VALIDATION_ERROR", fields }), {
      status: 400, headers: getCorsHeaders(corsOrigin),
    });
  }

  const data = parseResult.data;

  // Spam detection heuristics check
  if (detectSpamHeuristics({ ...data, website: rawPayload.website, honeypot: rawPayload.honeypot })) {
    return new Response(JSON.stringify({ success: false, error: "Spam detected" }), {
      status: 400, headers: getCorsHeaders(corsOrigin),
    });
  }

  // 8. Sanitization (Sanitize input for Storage)
  const sanitizedName = sanitizeForStorage(data.name, MAX_NAME_LENGTH);
  const sanitizedEmail = data.email.toLowerCase();
  const sanitizedSubject = sanitizeForStorage(data.subject, MAX_SUBJECT_LENGTH);
  const sanitizedMessage = sanitizeForStorage(data.message, MAX_MESSAGE_LENGTH);

  if (!isValidEmail(sanitizedEmail)) {
    return new Response(JSON.stringify({ success: false, error: "Invalid email after sanitization" }), {
      status: 400, headers: getCorsHeaders(corsOrigin),
    });
  }

  // 9. Server-Side Key Generation (never trust client timestamps)
  const serverTimestamp = new Date().toISOString();
  const randomHex = crypto.randomUUID().substring(0, 8);
  const storageKey = `contact:${serverTimestamp}:${randomHex}`;

  // Save to KV Store
  try {
    await kv.put(
      storageKey,
      JSON.stringify({
        name: sanitizedName,
        email: sanitizedEmail,
        subject: sanitizedSubject,
        message: sanitizedMessage,
        ip: request.headers.get("cf-connecting-ip") || "127.0.0.1",
        userAgent: request.headers.get("user-agent") || "unknown",
        createdAt: serverTimestamp,
      })
    );
  } catch (err) {
    console.error("Failed to write contact message to KV:", err);
    return new Response(JSON.stringify({ success: false, error: "Internal server storage error" }), {
      status: 500, headers: getCorsHeaders(corsOrigin),
    });
  }

  // 10. Email Notification Pattern
  const resendApiKey = context.env.RESEND_API_KEY;
  const fromEmail = context.env.RESEND_FROM_EMAIL || "notifications@pdfminty.com";
  const notificationEmail = context.env.NOTIFICATION_EMAIL || "admin@pdfminty.com";

  if (resendApiKey) {
    const safeName = sanitizeForHtml(sanitizedName);
    const safeSubject = sanitizeForHtml(sanitizedSubject);
    const safeMessage = sanitizeForHtml(sanitizedMessage);
    const safeEmail = sanitizeForHtml(sanitizedEmail);

    // Administrative Warning Email block
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [notificationEmail],
          subject: `[PDFMinty Inquiry] ${safeSubject} - from ${safeName}`,
          html: `<div style="font-family: sans-serif; line-height: 1.5; color: #333;">
            <h2 style="border-bottom: 1px solid #eee; padding-bottom: 10px;">New Inquiry received</h2>
            <p><strong>From:</strong> ${safeName} (&lt;${safeEmail}&gt;)</p>
            <p><strong>Subject:</strong> ${safeSubject}</p>
            <p><strong>Message:</strong></p>
            <blockquote style="background: #f9f9f9; padding: 15px; border-left: 4px solid #ccc; margin: 0;">
              ${safeMessage.replace(/\n/g, "<br>")}
            </blockquote>
          </div>`,
        }),
      });
    } catch (err) {
      console.error("Resend admin notify email sending failed:", err);
    }

    // Direct user receipt copy email block
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [sanitizedEmail],
          subject: `We received your inquiry: ${safeSubject}`,
          html: `<div style="font-family: sans-serif; line-height: 1.5; color: #333;">
            <h2>Hello ${safeName},</h2>
            <p>Thanks for reaching out to PDFMinty! We have received your inquiry regarding <strong>"${safeSubject}"</strong>.</p>
            <p>Our team will look into it promptly and get back to you within 24 to 48 hours.</p>
            <p>A copy of your message is included below for reference:</p>
            <blockquote style="background: #f9f9f9; padding: 15px; border-left: 4px solid #ccc; margin: 0;">
              ${safeMessage.replace(/\n/g, "<br>")}
            </blockquote>
            <p style="margin-top: 30px; font-size: 12px; color: #777;">This is an automated confirmation of safe delivery. Please do not reply directly to this email.</p>
          </div>`,
        }),
      });
    } catch (err) {
      console.error("Resend user receipt copy email sending failed:", err);
    }
  }

  // 11. Rate limit increment ONLY after all validation and successful KV storage passes
  await incrementRateLimit(request, kv, "contact", rateLimitResult.currentCount);

  return new Response(
    JSON.stringify({ success: true, message: "Thank you, your message has been sent successfully." }),
    { status: 200, headers: getCorsHeaders(corsOrigin) }
  );
};
