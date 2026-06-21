export const MAX_NAME_LENGTH = 100;
export const MAX_SUBJECT_LENGTH = 200;
export const MAX_MESSAGE_LENGTH = 5000;
export const MAX_COMMENT_LENGTH = 2000;
export const MAX_URL_LENGTH = 500;
export const MAX_STACK_LENGTH = 3000;

export function sanitizeForStorage(input: string | any, maxLength: number = MAX_MESSAGE_LENGTH): string {
  if (typeof input !== 'string') {
    if (input === null || input === undefined) return '';
    input = String(input);
  }
  const cleanInput = input.trim().replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '');
  return maxLength !== undefined && cleanInput.length > maxLength
    ? cleanInput.substring(0, maxLength)
    : cleanInput;
}

export function sanitizeForHtml(input: string | any): string {
  if (typeof input !== 'string') {
    if (input === null || input === undefined) return '';
    return String(input);
  }
  const map: Record<string, string> = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;',
  };
  return input.replace(/[&<>"']/g, (char) => map[char]);
}

export const sanitizeString = sanitizeForStorage;

export function isValidEmail(email: string | any): boolean {
  if (typeof email !== 'string') return false;
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return email.length <= 254 && emailRegex.test(email);
}

export function isValidUrl(url: string | any): boolean {
  if (typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
