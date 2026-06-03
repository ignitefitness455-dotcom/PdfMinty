/**
 * Sanitize strings to protect against XSS (Cross-Site Scripting) injections
 * before persisting payload data or treating it as safe HTML.
 */
export function sanitizeString(input: string | any): string {
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
 * Validates whether the email syntax is correct.
 */
export function isValidEmail(email: string | any): boolean {
  if (typeof email !== "string") {
    return false;
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}
