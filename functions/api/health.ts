import { getCorsOrigin, getCorsHeaders } from "../utils/cors";

export const onRequest: PagesFunction<any> = async (context) => {
  const { request } = context;
  const corsOrigin = getCorsOrigin(request);

  // Handle preflight OPTIONS request
  if (request.method === "OPTIONS") {
    const headers = getCorsHeaders(corsOrigin);
    headers["Access-Control-Allow-Methods"] = "GET, OPTIONS";
    return new Response(null, {
      status: 204,
      headers,
    });
  }

  // Handle GET request
  if (request.method === "GET") {
    const headers = getCorsHeaders(corsOrigin);
    return new Response(
      JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }),
      {
        status: 200,
        headers,
      }
    );
  }

  // Method Not Allowed
  const headers = getCorsHeaders(corsOrigin);
  return new Response(
    JSON.stringify({ success: false, error: "Method Not Allowed" }),
    {
      status: 405,
      headers,
    }
  );
};
