import { handleCors, createPreflightResponse } from "./utils/cors";

export const onRequest: PagesFunction = async (context) => {
  const { request } = context;

  // 1. Centralized OPTIONS preflight check
  if (request.method === "OPTIONS") {
    return createPreflightResponse(request);
  }

  // 2. Canonical Redirection: Redirect www and typo domains directly to non-www production domain
  const url = new URL(request.url);
  const hostname = url.hostname.toLowerCase();
  
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("192.168.");
  const isPagesDev = hostname.endsWith(".pages.dev");
  const isCloudRun = hostname.endsWith(".run.app");

  if (!isLocal && !isPagesDev && !isCloudRun && hostname !== "pdfminty.com") {
    const targetUrl = `https://pdfminty.com${url.pathname}${url.search}`;
    return new Response(null, {
      status: 301,
      headers: {
        "Location": targetUrl,
        "Cache-Control": "max-age=3600",
      },
    });
  }

  try {
    const response = await context.next();
    
    // Copy headers to a mutable object
    const mutableHeaders = new Headers(response.headers);
    
    // Dynamically apply CORS headers
    handleCors(request, mutableHeaders);
    
    // Consolidate static security headers centrally
    mutableHeaders.set("X-Content-Type-Options", "nosniff");
    mutableHeaders.set("X-Frame-Options", "DENY");
    mutableHeaders.set("X-XSS-Protection", "1; mode=block");
    mutableHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");
    mutableHeaders.set("Content-Security-Policy", "default-src 'self' https://cdnjs.cloudflare.com; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://cdnjs.cloudflare.com https://generativelanguage.googleapis.com https://api.resend.com; worker-src 'self' blob:;");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: mutableHeaders,
    });
  } catch (err: any) {
    console.error("Middleware unhandled exception:", err);
    const errorHeaders = handleCors(request, new Headers({ "Content-Type": "application/json" }));
    return new Response(
      JSON.stringify({
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred on the server.",
      }),
      { status: 500, headers: errorHeaders }
    );
  }
};
