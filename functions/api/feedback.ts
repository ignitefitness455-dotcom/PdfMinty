import { getCorsOrigin, getCorsHeaders } from "../utils/cors";
import { detectSpamHeuristics } from "../utils/spam";
import { checkRateLimit, incrementRateLimit } from "../utils/rateLimit";
import {
  sanitizeForStorage,
  sanitizeForHtml,
  isValidEmail,
  MAX_COMMENT_LENGTH
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
const feedbackSchema = z.object({
  rating: z.number().int().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5"),
  comment: z.string().trim().min(5, "Comment must be at least 5 characters").max(2000),
  email: z.union([z.literal(""), z.string().trim().email("Invalid email address")]).optional(),
});

function maskEmail(email: string): string {
  if (!email) return "";
  const parts = email.split("@");
  if (parts.length !== 2) return "";
  const [local, domain] = parts;
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const request = context.request;
  const corsOrigin = getCorsOrigin(request);

  // 1. OPTIONS preflight check
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: getCorsHeaders(corsOrigin) });
  }

  // 2. Fail-closed if KV is missing
  const kv = context.env.RATELIMIT_KV || context.env.PDFMINTY_KV;
  if (!kv) {
    return new Response(JSON.stringify({ success: false, error: "Service Temporarily Unavailable" }), {
      status: 503, headers: getCorsHeaders(corsOrigin),
    });
  }

  // Handle GET testimonials endpoint
  if (request.method === "GET") {
    // GET endpoint ALSO rate-limited (prevent abuse)
    const rateLimitResult = await checkRateLimit(request, kv, "feedback_get", 20);
    if (!rateLimitResult.allowed) {
      return new Response(JSON.stringify({ success: false, error: "Rate limit exceeded" }), {
        status: 429,
        headers: { ...getCorsHeaders(corsOrigin), "Retry-After": String(rateLimitResult.retryAfter) },
      });
    }

    try {
      // List qualifying testimonials from KV
      const list = await kv.list({ prefix: "fi:entry:", limit: 20 });
      const entries = [];
      for (const keyInfo of list.keys) {
        const val = await kv.get(keyInfo.name);
        if (val) {
          const parsed = JSON.parse(val);
          // Mask email for public display
          if (parsed.email) {
            parsed.email = maskEmail(parsed.email);
          } else {
            parsed.email = "Anonymous";
          }
          // Exclude IP for public display
          delete parsed.ip;
          entries.push(parsed);
        }
      }
      // Sort entries by date descending
      entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Increment GET rate limit
      await incrementRateLimit(request, kv, "feedback_get", rateLimitResult.currentCount);

      return new Response(JSON.stringify({ success: true, testimonials: entries }), {
        status: 200,
        headers: getCorsHeaders(corsOrigin),
      });
    } catch (err) {
      console.error("Failed to read testimonials from KV:", err);
      return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
        status: 500,
        headers: getCorsHeaders(corsOrigin),
      });
    }
  }

  // Handle POST feedback submission endpoint
  if (request.method === "POST") {
    // Rate Limiting Check (3/hour, Atomic Hourly Block)
    const rateLimitResult = await checkRateLimit(request, kv, "feedback", 3);
    if (!rateLimitResult.allowed) {
      return new Response(JSON.stringify({ success: false, error: "Rate limit exceeded" }), {
        status: 429,
        headers: { ...getCorsHeaders(corsOrigin), "Retry-After": String(rateLimitResult.retryAfter) },
      });
    }

    // Body Parsing and Validation (Size Limit 1MB)
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

    // Manual Honeypot validation (checked manually AFTER parsing)
    if (
      (rawPayload.website !== undefined && String(rawPayload.website).trim().length > 0) ||
      (rawPayload.honeypot !== undefined && String(rawPayload.honeypot).trim().length > 0)
    ) {
      return new Response(JSON.stringify({ success: false, error: "Spam detected" }), {
        status: 400, headers: getCorsHeaders(corsOrigin),
      });
    }

    // Zod Parsing
    const parseResult = feedbackSchema.safeParse(rawPayload);
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

    // Spam heuristics check
    if (detectSpamHeuristics({ ...data, website: rawPayload.website, honeypot: rawPayload.honeypot })) {
      return new Response(JSON.stringify({ success: false, error: "Spam detected" }), {
        status: 400, headers: getCorsHeaders(corsOrigin),
      });
    }

    // Sanitization (Sanitize input for Storage)
    const sanitizedComment = sanitizeForStorage(data.comment, MAX_COMMENT_LENGTH);
    const sanitizedEmail = data.email ? data.email.toLowerCase() : "";

    if (sanitizedEmail && !isValidEmail(sanitizedEmail)) {
      return new Response(JSON.stringify({ success: false, error: "Invalid email after sanitization" }), {
        status: 400, headers: getCorsHeaders(corsOrigin),
      });
    }

    // Qualifying review check: rating >= 4, wordCount >= 6
    const wordCount = sanitizedComment.split(/\s+/).filter(Boolean).length;
    const isQualifying = data.rating >= 4 && wordCount >= 6;

    // Server-Side Key Generation (never trust client timestamps)
    const serverTimestamp = new Date().toISOString();
    const randomHex = crypto.randomUUID().substring(0, 8);
    const keyPrefix = isQualifying ? "fi:entry" : "submission:feedback";
    const storageKey = `${keyPrefix}:${serverTimestamp}:${randomHex}`;

    // Save to KV Store
    try {
      await kv.put(
        storageKey,
        JSON.stringify({
          rating: data.rating,
          comment: sanitizedComment,
          email: sanitizedEmail,
          ip: request.headers.get("cf-connecting-ip") || "127.0.0.1",
          createdAt: serverTimestamp,
        })
      );
    } catch (err) {
      console.error("Failed to write feedback message to KV:", err);
      return new Response(JSON.stringify({ success: false, error: "Internal server storage error" }), {
        status: 500, headers: getCorsHeaders(corsOrigin),
      });
    }

    // Resend Email Notification Pattern
    const resendApiKey = context.env.RESEND_API_KEY;
    const fromEmail = context.env.RESEND_FROM_EMAIL || "notifications@pdfminty.com";
    const notificationEmail = context.env.NOTIFICATION_EMAIL || "admin@pdfminty.com";

    if (resendApiKey) {
      const safeComment = sanitizeForHtml(sanitizedComment);
      const safeEmail = sanitizedEmail ? sanitizeForHtml(sanitizedEmail) : "Anonymous";

      // Admin alert
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
            subject: `[PDFMinty Feedback] Rating: ${data.rating}/5 from ${safeEmail}`,
            html: `<div style="font-family: sans-serif; line-height: 1.5; color: #333;">
              <h2 style="border-bottom: 1px solid #eee; padding-bottom: 10px;">New Feedback received</h2>
              <p><strong>Rating:</strong> ${data.rating}/5</p>
              <p><strong>Email:</strong> ${safeEmail}</p>
              <p><strong>Qualifying for Testimonial:</strong> ${isQualifying ? "Yes" : "No"}</p>
              <p><strong>Comment:</strong></p>
              <blockquote style="background: #f9f9f9; padding: 15px; border-left: 4px solid #4a90e2; margin: 0;">
                ${safeComment.replace(/\n/g, "<br>")}
              </blockquote>
            </div>`,
          }),
        });
      } catch (err) {
        console.error("Resend feedback admin notification failed:", err);
      }

      // Optional user receipt
      if (sanitizedEmail) {
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
              subject: "Thank you for your feedback!",
              html: `<div style="font-family: sans-serif; line-height: 1.5; color: #333;">
                <h2>Thanks for sharing your thoughts!</h2>
                <p>We have safely received your feedback for PDFMinty. Here is a copy of your review comments:</p>
                <div style="background: #fdfdfd; border: 1px solid #e1e1e1; padding: 15px; border-radius: 4px;">
                  <strong style="color: #4a90e2;">Rating: ${data.rating}/5 stars</strong>
                  <p style="margin-top: 10px; font-style: italic;">"${safeComment}"</p>
                </div>
                <p>Your support is invaluable as we build a safer, faster, client-only PDF suite of tools.</p>
                <p style="margin-top: 30px; font-size: 12px; color: #777;">This is an automated confirmation. Please do not reply directly to this email.</p>
              </div>`,
            }),
          });
        } catch (err) {
          console.error("Resend feedback user receipt copy failed:", err);
        }
      }
    }

    // Rate limit increment ONLY on success
    await incrementRateLimit(request, kv, "feedback", rateLimitResult.currentCount);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Thank you, your feedback has been received and saved.",
      }),
      { status: 200, headers: getCorsHeaders(corsOrigin) }
    );
  }

  return new Response(JSON.stringify({ success: false, error: "Method Not Allowed" }), {
    status: 405, headers: getCorsHeaders(corsOrigin),
  });
};
