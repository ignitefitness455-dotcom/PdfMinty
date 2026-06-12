export const MAX_NAME_LENGTH = 100;
export const MAX_SUBJECT_LENGTH = 200;
export const MAX_MESSAGE_LENGTH = 5000;
export const MAX_COMMENT_LENGTH = 2000;
export const MAX_URL_LENGTH = 500;
export const MAX_STACK_LENGTH = 3000;

/**
 * Strips control characters (\x00-\x1F except \t, \n, \r), trims potential whitespace,
 * and truncates the string to a maximum length to prevent database bloat or failures.
 *
 * @param input The raw input to be sanitized for storage.
 * @param maxLength The maximum allowed length for the string. Defaults to MAX_MESSAGE_LENGTH.
 * @returns A sanitized, plain string ready for storage.
 */
export function sanitizeForStorage(input: string | any, maxLength: number = MAX_MESSAGE_LENGTH): string {
  if (typeof input !== "string") {
    if (input === null || input === undefined) {
      return "";
    }
    input = String(input);
  }

  // Strip control characters (ASCII 0-31), keeping tab (9), line feed (10), carriage return (13)
  let stripped = "";
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    if (code >= 32 || code === 9 || code === 10 || code === 13) {
      stripped += input[i];
    }
  }

  const cleanInput = stripped.trim();

  if (maxLength !== undefined && cleanInput.length > maxLength) {
    return cleanInput.substring(0, maxLength);
  }

  return cleanInput;
}

/**
 * Sanitize strings by escaping special HTML characters to protect against XSS (Cross-Site Scripting)
 * when rendering dynamic text inside HTML templates (notably email notifications).
 *
 * @param input The un-escaped string to be sanitized.
 * @returns An HTML-safe string with entity encodings.
 */
export function sanitizeForHtml(input: string | any): string {
  if (typeof input !== "string") {
    if (input === null || input === undefined) {
      return "";
    }
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

/**
 * Backwards-compatible alias for sanitizing string prior to raw storage.
 */
export const sanitizeString = sanitizeForStorage;

/**
 * Validates whether the email syntax is correct.
 *
 * @param email The email address to test.
 * @returns True if the email format matches standard patterns, false otherwise.
 */
export function isValidEmail(email: string | any): boolean {
  if (typeof email !== "string") {
    return false;
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validates whether the given string is a valid HTTP or HTTPS URL.
 *
 * @param url The URL string to test.
 * @returns True if the URL parses successfully and uses http or https protocol, false otherwise.
 */
export function isValidUrl(url: string | any): boolean {
  if (typeof url !== "string") {
    return false;
  }
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
