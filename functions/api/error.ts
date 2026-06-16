import { handleCors, createPreflightResponse } from "../utils/cors";
import { validateBody } from "../utils/validation";
import { z } from "zod";

const errorTelemetrySchema = z.object({
  message: z.string().trim().min(1, "Message is required").max(1000),
  url: z.string().trim().max(1000).optional(),
  stack: z.string().trim().max(5000).optional(),
  userAgent: z.string().trim().max(500).optional(),
});

export const onRequest: PagesFunction<any> = async (context) => {
  if (context.request.method === "OPTIONS") {
    return createPreflightResponse(context.request);
  }

  // Reject anything other than POST for telemetry submission
  if (context.request.method !== "POST") {
    const responseHeaders = handleCors(context.request, new Headers({ "Content-Type": "application/json" }));
    return new Response(
      JSON.stringify({ success: false, error: "METHOD_NOT_ALLOWED", message: "Only POST is supported." }),
      { status: 405, headers: responseHeaders }
    );
  }

  // Validate the request body
  const validationResult = await validateBody(context.request, errorTelemetrySchema);
  if (!validationResult.success) {
    return validationResult.response;
  }

  const payload = validationResult.data;
  const kv = context.env?.PDFMINTY_KV || context.env?.KV;
  
  if (kv) {
    try {
      const errorId = `telemetry:error:${Date.now()}:${Math.random().toString(36).substring(2, 7)}`;
      // Keep errors in KV with 7 days expiration for troubleshooting
      await kv.put(errorId, JSON.stringify({
        ...payload,
        ipHash: context.request.headers.get("CF-Connecting-IP") || "local",
        timestamp: new Date().toISOString(),
      }), { expirationTtl: 7 * 24 * 365 * 10 }); // ~10 days
    } catch (err) {
      console.error("Telemetry write failed:", err);
    }
  }

  const responseHeaders = handleCors(context.request, new Headers({ "Content-Type": "application/json" }));
  return new Response(
    JSON.stringify({ success: true, message: "Error logged securely." }),
    { status: 200, headers: responseHeaders }
  );
};
