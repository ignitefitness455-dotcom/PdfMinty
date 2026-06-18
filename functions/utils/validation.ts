import { z } from "zod";
import { getCorsOrigin, getCorsHeaders } from "./cors";

// CONSTANTS
export const MAX_NAME_LENGTH = 100;
export const MAX_SUBJECT_LENGTH = 200;
export const MAX_MESSAGE_LENGTH = 5000;
export const MAX_COMMENT_LENGTH = 2000;
export const MAX_URL_LENGTH = 500;
export const MAX_STACK_LENGTH = 3000;

// FUNCTION 1: sanitizeForStorage — strips control chars, truncates
// Use for: anything going into KV/database
export function sanitizeForStorage(input: string | any, maxLength: number): string {
  if (typeof input !== "string") {
    if (input === null || input === undefined) return "";
    input = String(input);
  }
  // Strip control chars (0-31), keep tab(9), newline(10), carriage-return(13)
  let stripped = "";
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    if (code >= 32 || code === 9 || code === 10 || code === 13) {
      stripped += input[i];
    }
  }
  const clean = stripped.trim();
  return clean.length > maxLength ? clean.substring(0, maxLength) : clean;
}

// FUNCTION 2: sanitizeForHtml — HTML entity encoding  
// Use for: anything rendered in HTML (especially email bodies)
export function sanitizeForHtml(input: string | any): string {
  if (typeof input !== "string") {
    if (input === null || input === undefined) return "";
    return String(input);
  }
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// Email validation
export function isValidEmail(email: string | any): boolean {
  if (typeof email !== "string") return false;
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

// URL validation  
export function isValidUrl(url: string | any): boolean {
  if (typeof url !== "string") return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/** Document name sanitizer — blocks control chars, limits length. */
export function sanitizeDocumentName(name: string): string {
  if (typeof name !== "string") return "document.pdf";
  let cleaned = "";
  for (let i = 0; i < name.length; i++) {
    const code = name.charCodeAt(i);
    if (code >= 32 && code !== 127) cleaned += name[i];
    else cleaned += " ";
  }
  return cleaned.replace(/\s+/g, " ").trim().substring(0, 100) || "document.pdf";
}

/** Truncate text by grapheme clusters (Unicode-safe). */
export function truncateText(text: string, maxGraphemes: number): string {
  const normalized = text.normalize("NFC");
  try {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    let count = 0, result = "";
    for (const segment of segmenter.segment(normalized)) {
      if (count >= maxGraphemes) break;
      result += segment.segment;
      count++;
    }
    return result;
  } catch {
    return normalized.substring(0, maxGraphemes);
  }
}

export interface ValidationErrorResponse {
  success: false;
  error: "VALIDATION_ERROR" | "JSON_PARSE_ERROR";
  message: string;
  fields?: Record<string, string>;
}

export async function validateBody<T>(
  request: Request,
  schema: z.Schema<T>
): Promise<{ success: true; data: T } | { success: false; response: Response }> {
  let bodyJson: any;
  const corsOrigin = getCorsOrigin(request);
  try {
    const text = await request.clone().text();
    if (!text.trim()) {
      bodyJson = {};
    } else {
      bodyJson = JSON.parse(text);
    }
  } catch (err) {
    const headers = getCorsHeaders(corsOrigin);
    return {
      success: false,
      response: new Response(
        JSON.stringify({
          success: false,
          error: "JSON_PARSE_ERROR",
          message: "The request body could not be parsed as valid JSON.",
        } as ValidationErrorResponse),
        { status: 400, headers }
      ),
    };
  }

  const result = schema.safeParse(bodyJson);
  if (!result.success) {
    const headers = getCorsHeaders(corsOrigin);
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const fieldPath = issue.path.join(".") || "body";
      fields[fieldPath] = issue.message;
    }

    return {
      success: false,
      response: new Response(
        JSON.stringify({
          success: false,
          error: "VALIDATION_ERROR",
          message: "Request validation failed.",
          fields,
        } as ValidationErrorResponse),
        { status: 400, headers }
      ),
    };
  }

  return { success: true, data: result.data };
}

export function validateQueryParams<T>(
  request: Request,
  schema: z.Schema<T>
): { success: true; data: T } | { success: false; response: Response } {
  const url = new URL(request.url);
  const params: Record<string, string> = {};
  for (const [key, value] of url.searchParams.entries()) {
    params[key] = value;
  }

  const corsOrigin = getCorsOrigin(request);
  const result = schema.safeParse(params);
  if (!result.success) {
    const headers = getCorsHeaders(corsOrigin);
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const fieldPath = issue.path.join(".") || "query";
      fields[fieldPath] = issue.message;
    }

    return {
      success: false,
      response: new Response(
        JSON.stringify({
          success: false,
          error: "VALIDATION_ERROR",
          message: "Query parameter validation failed.",
          fields,
        } as ValidationErrorResponse),
        { status: 400, headers }
      ),
    };
  }

  return { success: true, data: result.data };
}
