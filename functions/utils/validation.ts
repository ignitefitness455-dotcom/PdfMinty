import { z } from "zod";
import { handleCors } from "./cors";

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
  try {
    const text = await request.clone().text();
    if (!text.trim()) {
      bodyJson = {};
    } else {
      bodyJson = JSON.parse(text);
    }
  } catch (err) {
    const headers = handleCors(request, new Headers({ "Content-Type": "application/json" }));
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
    const headers = handleCors(request, new Headers({ "Content-Type": "application/json" }));
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

  const result = schema.safeParse(params);
  if (!result.success) {
    const headers = handleCors(request, new Headers({ "Content-Type": "application/json" }));
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
