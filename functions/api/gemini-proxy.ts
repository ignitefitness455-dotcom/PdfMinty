import { handleCors, createPreflightResponse } from "../utils/cors";
import { checkRateLimit } from "../utils/rateLimit";
import { validateBody } from "../utils/validation";
import { z } from "zod";

// Zod schema enforcing typing aligned with standard Gemini REST content gen model structure
const geminiProxySchema = z.object({
  contents: z
    .array(
      z.object({
        role: z.string().optional(),
        parts: z
          .array(
            z.object({
              text: z.string().trim().min(1, "Text content is required").max(1000000), // Max 1M characters to prevent memory-bloating
            })
          )
          .min(1, "Each content node must contain at least one part"),
      })
    )
    .min(1, "Contents must contain at least one message node"),
  generationConfig: z
    .object({
      temperature: z.number().min(0).max(2).optional(),
      maxOutputTokens: z.number().int().positive().optional(),
    })
    .optional(),
});

export const onRequest: PagesFunction<any> = async (context) => {
  if (context.request.method === "OPTIONS") {
    return createPreflightResponse(context.request);
  }

  // Reject non-POST requests
  if (context.request.method !== "POST") {
    const headers = handleCors(context.request, new Headers({ "Content-Type": "application/json" }));
    return new Response(
      JSON.stringify({ success: false, error: "METHOD_NOT_ALLOWED", message: "Only POST requests are supported." }),
      { status: 405, headers }
    );
  }

  // 1. Enforce strict MIME-type allowlist
  const contentType = context.request.headers.get("Content-Type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    const headers = handleCors(context.request, new Headers({ "Content-Type": "application/json" }));
    return new Response(
      JSON.stringify({
        success: false,
        error: "UNSUPPORTED_MEDIA_TYPE",
        message: "Content-Type must be 'application/json'.",
      }),
      { status: 415, headers }
    );
  }

  // 2. Enforce strict request size limits (Max 4MB to prevent resource exhaustion attacks)
  const contentLength = context.request.headers.get("Content-Length");
  if (contentLength && parseInt(contentLength) > 4 * 1024 * 1024) {
    const headers = handleCors(context.request, new Headers({ "Content-Type": "application/json" }));
    return new Response(
      JSON.stringify({
        success: false,
        error: "PAYLOAD_TOO_LARGE",
        message: "Request payload size exceeds the maximum limit of 4MB.",
      }),
      { status: 413, headers }
    );
  }

  // 3. Sliding window IP Rate Limiting: max 10 requests per minute (60 seconds)
  const rateLimitResult = await checkRateLimit(context.request, context.env, "gemini-proxy", 10, 60);
  if (!rateLimitResult.allowed) {
    const headers = handleCors(context.request, new Headers({ "Content-Type": "application/json" }));
    headers.set("Retry-After", String(rateLimitResult.resetSeconds));
    return new Response(
      JSON.stringify({
        success: false,
        error: "TOO_MANY_REQUESTS",
        message: `Rate limit exceeded. Please retry after ${rateLimitResult.resetSeconds} seconds.`,
      }),
      { status: 429, headers }
    );
  }

  // 4. Validate body contents using Zod schema
  const validationResult = await validateBody(context.request, geminiProxySchema);
  if (!validationResult.success) {
    return validationResult.response;
  }

  const validatedPayload = validationResult.data;

  // Retrieve Gemini API Key safely
  const apiKey = context.env?.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Critical SRE Alert: GEMINI_API_KEY environment variable is not defined.");
    const headers = handleCors(context.request, new Headers({ "Content-Type": "application/json" }));
    return new Response(
      JSON.stringify({
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "AI service configuration is missing.",
      }),
      { status: 500, headers }
    );
  }

  // Constrain target model endpoint URL (using Google recommended gemini-2.5-flash)
  const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  // Helper to execute outgoing fetch with rigid 8-second timeout constraints
  const fetchWithTimeout = async (): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second SRE SLA timeout limit

    try {
      const upstreamRes = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedPayload),
        signal: controller.signal,
      });
      return upstreamRes;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  let upstreamResponse: Response | null = null;
  let attempts = 0;
  const maxAttempts = 2; // Initial attempt + single retry on 5xx or timeout

  while (attempts < maxAttempts) {
    attempts++;
    try {
      upstreamResponse = await fetchWithTimeout();

      // If it is a successful response or standard user error (4xx), do not retry
      if (upstreamResponse.status < 500) {
        break;
      }
      
      console.warn(`Upstream error ${upstreamResponse.status} on attempt ${attempts}. Retrying...`);
    } catch (err: any) {
      const isAbort = err.name === "AbortError";
      console.warn(`Fetch error (${isAbort ? "timeout" : err.message}) on attempt ${attempts}. Retrying...`);
      if (attempts >= maxAttempts) {
        const headers = handleCors(context.request, new Headers({ "Content-Type": "application/json" }));
        return new Response(
          JSON.stringify({
            success: false,
            error: "UPSTREAM_TIMEOUT",
            message: "The connection to AI servers timed out. Please try again.",
          }),
          { status: 504, headers }
        );
      }
    }
  }

  const responseHeaders = handleCors(context.request, new Headers({ "Content-Type": "application/json" }));

  if (!upstreamResponse) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "UPSTREAM_UNAVAILABLE",
        message: "Failed to establish a connection with the backend AI module.",
      }),
      { status: 502, headers: responseHeaders }
    );
  }

  // 5. Clean, sanitise and forward responses without leaking keys or raw error traces
  if (!upstreamResponse.ok) {
    console.error(`Upstream Gemini failure reported: Status=${upstreamResponse.status}`);
    // Hide exact raw upstream error payloads to prevent system fingerprinting / API key leakage
    return new Response(
      JSON.stringify({
        success: false,
        error: "UPSTREAM_API_ERROR",
        message: "The AI processor returned a server error. Please retry shortly.",
      }),
      { status: 502, headers: responseHeaders }
    );
  }

  try {
    const rawData: any = await upstreamResponse.json();
    return new Response(JSON.stringify({ success: true, data: rawData }), {
      status: 200,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error("Failed to parse Gemini response payload:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: "UPSTREAM_FORMAT_ERROR",
        message: "Invalid response format returned by the upstream database.",
      }),
      { status: 502, headers: responseHeaders }
    );
  }
};
