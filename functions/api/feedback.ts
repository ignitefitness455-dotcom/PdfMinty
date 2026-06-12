import { 
  sanitizeForStorage, 
  sanitizeForHtml, 
  isValidEmail, 
  MAX_COMMENT_LENGTH 
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

  // GET /api/feedback — Public testimonials endpoint
  if (request.method === "GET") {
    const kv = context.env.RATELIMIT_KV;
    if (!kv) {
      return new Response(JSON.stringify({ success: false, reviews: [] }), {
        status: 200,
        headers: getCorsHeaders(corsOrigin),
      });
    }

    try {
      // SECURITY FIX: Query cached index first for raw speed & efficiency
      const indexRaw = await kv.get("feedback_index");
      if (indexRaw) {
        const reviews = JSON.parse(indexRaw);
        return new Response(JSON.stringify({ success: true, reviews }), {
          status: 200,
          headers: {
            ...getCorsHeaders(corsOrigin),
            "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
          },
        });
      }

      // SECURITY FIX: Prevent race conditions by querying independent entries instead of locking/updating a shared index
      const listed = await kv.list({ prefix: "fi:entry:" });
      const entries = await Promise.all(
        listed.keys.map(k => kv.get(k.name).then(v => v ? JSON.parse(v) : null))
      );

      const validEntries = entries
        .filter((e): e is { rating: number; comment: string; displayEmail: string | null; timestamp: string } => e !== null)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 15);

      // SECURITY FIX: Save rebuilt index with 300s TTL to protect bandwidth constraints
      await kv.put("feedback_index", JSON.stringify(validEntries), { expirationTtl: 300 });

      return new Response(JSON.stringify({ success: true, reviews: validEntries }), {
        status: 200,
        headers: {
          ...getCorsHeaders(corsOrigin),
          "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
        },
      });
    } catch {
      return new Response(JSON.stringify({ success: true, reviews: [] }), {
        status: 200,
        headers: getCorsHeaders(corsOrigin),
      });
    }
  }

  // Reject anything that is not POST or GET
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
          headers: getCorsHeaders(corsOrigin),
        }
      );
    }

    // Identify Client IP and check hourly rate limit using an atomic counter
    const ip = request.headers.get("cf-connecting-ip") || "127.0.0.1";
    const now = Math.floor(Date.now() / 1000);
    const hourBlock = now - (now % 3600);
    const rateLimitKey = `rate_limit:feedback:${ip}:${hourBlock}`;
    const limit = 3;

    const countStr = await kv.get(rateLimitKey);
    const count = countStr ? parseInt(countStr, 10) : 0;

    if (count >= limit) {
      return new Response(
        JSON.stringify({ success: false, error: "Rate limit exceeded. Too many requests from this IP in the last hour." }),
        {
          status: 429,
          headers: getCorsHeaders(corsOrigin),
        }
      );
    }

    // Parse the JSON body
    let payload: any;
    try {
      payload = await request.json();
    } catch (_) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON payload" }),
        {
          status: 400,
          headers: getCorsHeaders(corsOrigin),
        }
      );
    }

    // payload must be a valid JSON object
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return new Response(
        JSON.stringify({ success: false, error: "Request body must be a valid JSON object." }),
        {
          status: 400,
          headers: getCorsHeaders(corsOrigin),
        }
      );
    }

    const { rating, comment: rawComment, email: rawEmail, timestamp } = payload;

    const parsedRating = Number(rating);
    if (!rating || isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return new Response(
        JSON.stringify({ success: false, error: "Rating must be a number between 1 and 5" }),
        {
          status: 400,
          headers: getCorsHeaders(corsOrigin),
        }
      );
    }

    // Validate email syntax if provided
    if (rawEmail && typeof rawEmail === "string" && rawEmail.trim() !== "" && !isValidEmail(rawEmail.trim())) {
      return new Response(
        JSON.stringify({ success: false, error: "The provided email address is invalid" }),
        {
          status: 400,
          headers: getCorsHeaders(corsOrigin),
        }
      );
    }

    // Sanitize comment and email (if present) before usage or storage
    // SECURITY FIX: Use sanitizeForStorage to keep clean storage integrity with MAX_COMMENT_LENGTH validation
    const comment = sanitizeForStorage(rawComment?.trim(), MAX_COMMENT_LENGTH);
    const email = rawEmail ? sanitizeForStorage(rawEmail.trim(), 200) : undefined;

    if (!comment || comment === "") {
      return new Response(
        JSON.stringify({ success: false, error: "Comment is required and cannot be empty" }),
        {
          status: 400,
          headers: getCorsHeaders(corsOrigin),
        }
      );
    }

    // SECURITY FIX: Rate counter incremented after payload validation — prevents legitimate users
    // from losing quota on invalid input. Abuse prevention is maintained because
    // attackers hitting valid payloads still get counted.
    await kv.put(rateLimitKey, (count + 1).toString(), { expirationTtl: 3600 });

    // Store in KV
    // SECURITY FIX: Generate keys completely server-side. Do not trust client timestamps which can pollute or corrupt KV namespaces
    const serverTimestamp = new Date().toISOString();
    const randomHex = crypto.randomUUID().substring(0, 8);
    const storageKey = `feedback:${serverTimestamp}:${randomHex}`;
    
    // SECURITY FIX: Limit client-supplied timestamp string parameter to avoid buffer bloating or injection
    const clientTimestamp = sanitizeForStorage(String(timestamp || ""), 50);

    const storageValue = JSON.stringify({
      rating: parsedRating,
      comment,
      email: email || undefined,
      clientTimestamp,
      timestamp: serverTimestamp,
      ip,
    });

    await kv.put(storageKey, storageValue);

    // SECURITY FIX: Avoid race conditions by writing qualifying reviews to independent fi:entry keys
    const wordCount = comment.trim().split(/\s+/).filter(Boolean).length;
    if (parsedRating >= 4 && wordCount >= 6) {
      try {
        // Mask email for public display
        let displayEmail: string | undefined = undefined;
        if (email) {
          const emailParts = email.split("@");
          if (emailParts.length === 2) {
            const [localPart, domain] = emailParts;
            const maskedLocal = localPart.length > 2
              ? localPart[0] + "***" + localPart[localPart.length - 1]
              : "***";
            displayEmail = `${maskedLocal}@${domain}`;
          } else {
            displayEmail = "***";
          }
        }

        const newEntry = {
          rating: parsedRating,
          comment,
          displayEmail: displayEmail || null,
          timestamp: serverTimestamp,
        };

        const entryId = crypto.randomUUID();
        const entryKey = `fi:entry:${serverTimestamp}:${entryId.substring(0, 8)}`;
        await kv.put(entryKey, JSON.stringify(newEntry), { expirationTtl: 86400 * 60 }); // 60 days TTL
      } catch (indexErr: any) {
        console.error("Failed to update feedback_index entry:", indexErr);
      }
    }

    // Send email notification via Resend if API key is present
    const resendApiKey = context.env.RESEND_API_KEY;
    if (resendApiKey) {
      const fromEmail = context.env.RESEND_FROM_EMAIL || "PDFMinty <onboarding@resend.dev>";
      const adminEmail = context.env.NOTIFICATION_EMAIL || "pdfminty@gmail.com";

      try {
        // Send email message to the Admin
        const starsText = "★".repeat(parsedRating) + "☆".repeat(5 - parsedRating);
        const adminEmailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [adminEmail],
            subject: `[PDFMinty Feedback] ${parsedRating}/5 Stars - ${email ? "from " + email : "Anonymous submission"}`,
            // SECURITY FIX: Switched from direct variable interpolation to sanitizeForHtml() calls to completely block XSS execution inside the email body
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; color: #1e293b;">
                <div style="background-color: #0f172a; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: bold; letter-spacing: -0.025em;">New User Feedback</h1>
                </div>
                <div style="margin-bottom: 20px; line-height: 1.6;">
                  <div style="margin-bottom: 12px;">
                    <strong style="color: #475569;">Rating:</strong> 
                    <span style="font-size: 18px; color: #fbbf24; font-weight: bold; margin-left: 4px;">${starsText}</span>
                    <span style="font-size: 14px; color: #64748b; margin-left: 6px;">(${parsedRating} out of 5)</span>
                  </div>
                  <div style="margin-bottom: 12px;">
                    <strong style="color: #475569;">Submitter:</strong> 
                    <span style="font-size: 15px; font-weight: 500;">${email ? sanitizeForHtml(email) : "Anonymous user"}</span>
                  </div>
                </div>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
                <div style="margin-bottom: 25px;">
                  <strong style="color: #475569; display: block; margin-bottom: 8px;">Comment Content:</strong>
                  <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #fbbf24; font-size: 15px; line-height: 1.6; white-space: pre-wrap; color: #334155;">${sanitizeForHtml(comment)}</div>
                </div>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
                <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">Sent via PDFMinty Secure Edge Service • Submitted from IP ${sanitizeForHtml(ip)} at ${sanitizeForHtml(serverTimestamp)}</p>
              </div>
            `,
          }),
        });

        if (!adminEmailResponse.ok) {
          const errMsg = await adminEmailResponse.text();
          console.error("Resend Admin feedback notification failed:", adminEmailResponse.status, errMsg);
        }
      } catch (err: any) {
        console.error("Error sending Admin feedback email via Resend:", err);
      }

      // Try sending a confirmation to the user if they provided an email
      if (email) {
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
              subject: `Thank you for your feedback! - PDFMinty`,
              // SECURITY FIX: Switched from raw interpolation to sanitizeForHtml() calls to completely block XSS execution inside the email body
              // SECURITY FIX: Replaced "Player reviews..." copy-paste mistake with correct human text matching PDFMinty platform context
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; color: #1e293b;">
                  <div style="background-color: #0f172a; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: bold; letter-spacing: -0.025em;">Feedback Received!</h1>
                  </div>
                  <p style="font-size: 16px; line-height: 1.6; margin-bottom: 12px;">Hi there,</p>
                  <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
                    Thank you for sharing your thoughts with us. We've received your ${parsedRating}/5 star feedback. Your feedback and reviews help us improve PDFMinty for everyone. We read every submission carefully.
                  </p>
                  <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
                    If there's anything else you'd like to suggest or if you experience any bugs, please don't hesitate to reach out!
                  </p>
                  <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
                  <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">PDFMinty — Secure Offline PDF Studio • Standard Client-side Utility Engine</p>
                </div>
              `,
            }),
          });

          if (!userEmailResponse.ok) {
            const errMsg = await userEmailResponse.text();
            console.warn("Resend User feedback confirmation skipped or rejected:", userEmailResponse.status, errMsg);
          }
        } catch (err: any) {
          console.warn("Error sending User feedback confirmation email via Resend:", err);
        }
      }
    } else {
      console.warn("Resend API Key is missing in this context. Feedback Email skipped (Stored in KV successfully).");
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: getCorsHeaders(corsOrigin),
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || "An unexpected error occurred" }),
      {
        status: 500,
        headers: getCorsHeaders(corsOrigin),
      }
    );
  }
};
