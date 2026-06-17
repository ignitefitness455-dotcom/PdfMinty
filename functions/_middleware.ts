import { handleCors, createPreflightResponse } from "./utils/cors";

export const onRequest: PagesFunction = async (context) => {
  const { request } = context;

  if (request.method === "OPTIONS") {
    return createPreflightResponse(request);
  }

  try {
    const response = await context.next();
    
    // Copy the original headers to a mutableHeaders
    const mutableHeaders = new Headers(response.headers);
    
    // Dynamically apply CORS headers
    handleCors(request, mutableHeaders);
    
    // Consolidate static security headers centrally
    mutableHeaders.set("X-Content-Type-Options", "nosniff");
    mutableHeaders.set("X-Frame-Options", "DENY");
    mutableHeaders.set("X-XSS-Protection", "1; mode=block");
    mutableHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");
    mutableHeaders.set("Content-Security-Policy", "default-src 'self' https://cdnjs.cloudflare.com; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://cdnjs.cloudflare.com https://generativelanguage.googleapis.com; worker-src 'self' blob:;");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: mutableHeaders,
    });
  } catch (err: any) {
    const errorHeaders = handleCors(request, new Headers({ "Content-Type": "application/json" }));
    return new Response(
      JSON.stringify({
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: err.message || "An unexpected error occurred on the server.",
      }),
      { status: 500, headers: errorHeaders }
    );
  }
};
