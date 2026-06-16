import { handleCors, createPreflightResponse } from "../utils/cors";
import { checkRateLimit } from "../utils/rateLimit";
import { detectSpamHeuristics } from "../utils/spam";
import { validateBody } from "../utils/validation";
import { z } from "zod";

const feedbackSchema = z.object({
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z.string().trim().min(5, "Feedback comment must contain at least 5 characters").max(2000),
  email: z.union([z.literal(""), z.string().trim().email("Invalid email address")]).optional(),
  website: z.string().optional(),
});

export const onRequest: PagesFunction<any> = async (context) => {
  if (context.request.method === "OPTIONS") {
    return createPreflightResponse(context.request);
  }

  // Reject non-POST requests
  if (context.request.method !== "POST") {
    const responseHeaders = handleCors(context.request, new Headers({ "Content-Type": "application/json" }));
    return new Response(
      JSON.stringify({ success: false, error: "METHOD_NOT_ALLOWED", message: "Only POST requests are supported." }),
      { status: 405, headers: responseHeaders }
    );
  }

  // 1. Rate Limiting: max 5 feedback submissions per rolling hour (3600 seconds)
  const rateLimitResult = await checkRateLimit(context.request, context.env, "feedback", 5, 3600);
  if (!rateLimitResult.allowed) {
    const responseHeaders = handleCors(context.request, new Headers({ "Content-Type": "application/json" }));
    responseHeaders.set("Retry-After", String(rateLimitResult.resetSeconds));
    return new Response(
      JSON.stringify({
        success: false,
        error: "TOO_MANY_REQUESTS",
        message: `Too many submissions. Please wait ${rateLimitResult.resetSeconds} seconds before trying again.`,
      }),
      { status: 429, headers: responseHeaders }
    );
  }

  // 2. Body Schema Validation
  const validationResult = await validateBody(context.request, feedbackSchema);
  if (!validationResult.success) {
    return validationResult.response;
  }

  const payload = validationResult.data;

  // 3. Spam Detection Heuristics & Honeypot Checks
  if (detectSpamHeuristics(payload)) {
    const responseHeaders = handleCors(context.request, new Headers({ "Content-Type": "application/json" }));
    return new Response(
      JSON.stringify({
        success: false,
        error: "SPAM_DETECTED",
        message: "Your submission was flagged by our security filters.",
      }),
      { status: 400, headers: responseHeaders }
    );
  }

  // Add submission to KV to process or record
  const kv = context.env?.PDFMINTY_KV || context.env?.KV;
  if (kv) {
    try {
      const submissionId = `submission:feedback:${Date.now()}:${Math.random().toString(36).substring(2, 7)}`;
      await kv.put(submissionId, JSON.stringify({
        ...payload,
        ip: context.request.headers.get("CF-Connecting-IP") || "local",
        userAgent: context.request.headers.get("User-Agent") || "unknown",
        createdAt: new Date().toISOString(),
      }));
    } catch (err) {
      console.error("Failed to write feedback submission to KV:", err);
    }
  }

  const responseHeaders = handleCors(context.request, new Headers({ "Content-Type": "application/json" }));
  return new Response(
    JSON.stringify({
      success: true,
      message: "Your feedback has been successfully submitted.",
    }),
    { status: 200, headers: responseHeaders }
  );
};
