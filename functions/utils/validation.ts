export const MAX_NAME_LENGTH = 100;
export const MAX_SUBJECT_LENGTH = 200;
export const MAX_MESSAGE_LENGTH = 5000;

export function sanitizeForStorage(input: string): string {
  if (!input) return '';
  // Trim and strip control characters (except maybe newlines\tabs if we want, but strip \x00-\x1f except \r,\n,\t and \x7f)
  return input.trim().replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

export function sanitizeForHtml(input: string): string {
  if (!input) return '';
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
  };
  return input.replace(/[&<>"']/g, (char) => map[char]);
}

export function isValidEmail(email: string): boolean {
  if (!email) return false;
  // RFC 5322-ish standard regex
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return email.length <= 254 && emailRegex.test(email);
}
