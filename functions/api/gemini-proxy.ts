import { GoogleGenAI } from "@google/genai";
import { getCorsOrigin, getCorsHeaders, isAllowedOrigin } from "../utils/cors";

interface Env {
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
  RATELIMIT_KV?: any; // KVNamespace
}

export const onRequestOptions: PagesFunction<Env> = async (context) => {
  const corsOrigin = getCorsOrigin(context.request);
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(corsOrigin),
  });
};

function truncateText(text: string, maxGraphemes: number): string {
  const normalized = text.normalize("NFC");
  try {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    let count = 0;
    let result = "";
    for (const segment of segmenter.segment(normalized)) {
      if (count >= maxGraphemes) break;
      result += segment.segment;
      count++;
    }
    return result;
  } catch (e) {
    return normalized.substring(0, maxGraphemes);
  }
}

// In-memory emergency fallback (per isolate, resets on cold start)
const memoryRateLimit = new Map<string, number>();

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // 1. Strict Origin / Domain Safety Checks
  const origin = request.headers.get("Origin") || "";
  const corsOrigin = getCorsOrigin(request);
  const corsHeaders = getCorsHeaders(corsOrigin);

  if (!isAllowedOrigin(origin)) {
    return new Response(
      JSON.stringify({ success: false, error: "Access Denied: Unregistered Origin." }),
      { status: 403, headers: corsHeaders }
    );
  }

  // 2. Client Rate Limiting (fail-closed with in-memory fallback)
  const clientIp = request.headers.get("CF-Connecting-IP") || "local_dev";
  const limitKey = `ratelimit:${clientIp}`;
  
  if (env.RATELIMIT_KV) {
    try {
      const now = Math.floor(Date.now() / 1000);
      const hourBlock = now - (now % 3600);
      const blockKey = `${limitKey}:${hourBlock}`;
      
      const countStr = await env.RATELIMIT_KV.get(blockKey);
      const count = countStr ? parseInt(countStr, 10) : 0;
      
      if (count >= 30) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Too Many Requests: Rate limit of 30 secure operations per hour reached. Please try again soon." 
          }),
          { 
            status: 429, 
            headers: corsHeaders
          }
        );
      }
      
      await env.RATELIMIT_KV.put(blockKey, (count + 1).toString(), { expirationTtl: 3600 });
    } catch (kvErr: any) {
      console.error("Rate limiting KV failure, using fail-closed in-memory fallback:", kvErr);
      const memCount = memoryRateLimit.get(clientIp) ?? 0;
      if (memCount >= 3) { // Strict limit during KV outage
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Service Temporarily Unavailable: Database connection issues. Emergency rate limit of 3 requests exceeded." 
          }),
          { 
            status: 503, 
            headers: corsHeaders
          }
        );
      }
      memoryRateLimit.set(clientIp, memCount + 1);
    }
  }

  // 3. Extract Payload
  let extractedText = "";
  let documentName = "";
  
  try {
    const body: any = await request.json();
    extractedText = body.text || "";
    documentName = body.name || "confidential_document.pdf";
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: "Payload verification failed: invalid JSON body input." }),
      { 
        status: 400, 
        headers: corsHeaders
      }
    );
  }

  if (!extractedText || extractedText.trim().length === 0) {
    return new Response(
      JSON.stringify({ success: false, error: "Missing Target Text: PDF text extraction produced empty content." }),
      { 
        status: 400, 
        headers: corsHeaders
      }
    );
  }

  // 4. Validate Server Credentials
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    const envKeys = Object.keys(env || {}).join(", ") || "none";
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Server configuration issue: Gemini API credentials are not set. Found variables: [${envKeys}]. Please ensure GEMINI_API_KEY is spelled correctly and redeploy.` 
      }),
      { 
        status: 501, 
        headers: corsHeaders
      }
    );
  }

  const modelName = env.GEMINI_MODEL ?? "gemini-2.0-flash";
  const VALID_MODELS = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-2.0-flash",
    "gemini-2.5-flash-preview-05-20"
  ];

  if (!VALID_MODELS.includes(modelName)) {
    return new Response(
      JSON.stringify({ success: false, error: `Invalid model: ${modelName}` }),
      { status: 500, headers: corsHeaders }
    );
  }

  // 5. Invoke Google Gemini AI
  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const prompt = `You are an expert document intelligence assistant.
Analyze the following extracted text from the PDF file named "${documentName}".
Provide a professional, complete analysis structured strictly into:
1. Short Executive Summary (2-3 sentences)
2. Document Categorization / Classification (e.g. Legal Agreement, Financial Statement, Invoice, Technical Spec, Memo, etc.)
3. Key Insights / Salient Points (bullet points)
4. Critical Action Items or Deadlines extracted (if any)
5. Suggested Next Steps

Extracted PDF Content:
---
${truncateText(extractedText, 40000)}
---`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        temperature: 0.2,
      },
    });

    const analysisText = response.text || "Detailed analysis could not be generated from the document text.";

    return new Response(
      JSON.stringify({ success: true, analysis: analysisText }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (apiErr: any) {
    console.error("Gemini API Client Invocation Error:", apiErr);
    return new Response(
      JSON.stringify({
        success: false,
        error: `An upstream error occurred during AI analysis: ${apiErr instanceof Error ? apiErr.message : String(apiErr)}`
      }),
      {
        status: 502,
        headers: corsHeaders,
      }
    );
  }
};
