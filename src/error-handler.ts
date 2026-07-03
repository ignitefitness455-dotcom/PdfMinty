import { logger } from './utils/logger';

/**
 * Scrub common PII patterns from a string before logging or telemetry.
 *
 * Covered:
 * - Email addresses
 * - IPv4 addresses
 * - IPv6 addresses (compressed and full forms)
 * - JWT tokens (eyJ... header.payload.signature)
 * - Bearer tokens in Authorization-style strings
 * - Generic API key patterns (key=..., token=...)
 * - Unix/macOS home folder paths (/Users/foo, /home/foo)
 * - Windows user profile paths (C:\Users\foo)
 * - US phone numbers (XXX-XXX-XXXX, (XXX) XXX-XXXX, XXX.XXX.XXXX)
 * - Credit-card-shaped digit sequences (groups of 4 digits, 13-19 total)
 *
 * Best-effort, not a security boundary. Never log raw user-controlled input.
 */
export function scrubPII(input: string): string {
  if (!input) return '';

  const patterns: Array<[RegExp, string]> = [
    // JWT (must come before generic bearer to be more specific).
    [/\beyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\b/g, '[REDACTED_JWT]'],
    // Authorization: Bearer ...
    [/\bBearer\s+[A-Za-z0-9._~+/=-]+/gi, 'Bearer [REDACTED_TOKEN]'],
    // Use capturing group (not non-capturing) so $1 refers to the key name.
    [/\b(api[_-]?key|access[_-]?token|refresh[_-]?token|secret|password|token)\s*[:=]\s*[^\s&]+/gi, '$1=[REDACTED]'],
    // Email.
    [/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]'],
    // IPv4.
    [/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g, '[REDACTED_IP]'],
    // IPv6 (full and compressed).
    [/\b(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}\b/g, '[REDACTED_IP]'],
    [/\b(?:[A-Fa-f0-9]{1,4}:){1,7}:\b/g, '[REDACTED_IP]'],
    [/\b::(?:[A-Fa-f0-9]{1,4}:){0,6}[A-Fa-f0-9]{1,4}\b/g, '[REDACTED_IP]'],
    // US phone numbers.
    [/\b\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[REDACTED_PHONE]'],
    // Credit-card-shaped (groups of 4 digits, 13-19 total).
    [/\b(?:\d[ -]?){13,19}\b/g, '[REDACTED_CC]'],
    // Unix/macOS home folders.
    [/(\/(?:Users|home)\/)[a-zA-Z0-9._-]+/g, '$1[REDACTED_USER]'],
    // Windows user profile paths.
    [/([a-zA-Z]:\\Users\\)[a-zA-Z0-9._-]+/g, '$1[REDACTED_USER]'],
  ];

  let result = input;
  for (const [pattern, replacement] of patterns) {
    result = result.replace(pattern, replacement as string);
  }
  return result;
}

const REPORT_TIMEOUT_MS = 5000;

export function reportErrorToTelemetry(message: string, stack: string): void {
  const cleanMessage = scrubPII(message);
  const cleanStack = scrubPII(stack);

  // AbortController gives us a hard timeout so a slow `/api/error` doesn't
  // hang the page navigation. We swallow the error (best-effort telemetry)
  // but log it at debug level so it's visible during development.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REPORT_TIMEOUT_MS);

  fetch('/api/error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: cleanMessage,
      stack: cleanStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    }),
    signal: controller.signal,
    keepalive: true, // Allow the request to outlive the page if needed.
  })
    .catch((err) => {
      logger.debug('Error telemetry failed:', err);
    })
    .finally(() => clearTimeout(timer));
}

/**
 * Install global error and unhandled-rejection listeners.
 * Returns a cleanup function so callers (e.g. StrictMode double-mount or HMR)
 * can remove duplicate listeners.
 */
export function setupErrorTelemetry(): () => void {
  const onError = (event: ErrorEvent) => {
    if (!event.message) return;
    const msg = event.message.toLowerCase();
    // Benign browser / ResizeObserver / extension errors that should not trigger telemetry or fail page audits
    if (
      msg.includes('resizeobserver') ||
      msg.includes('script error') ||
      msg.includes('non-error promise rejection')
    ) {
      event.stopImmediatePropagation?.();
      event.preventDefault?.();
      return;
    }
    reportErrorToTelemetry(event.message, event.error?.stack || '');
  };

  const onRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    const message = reason instanceof Error ? reason.message : String(reason);
    const msgLower = message.toLowerCase();
    if (
      msgLower.includes('resizeobserver') ||
      msgLower.includes('script error') ||
      msgLower.includes('abort') ||
      msgLower.includes('canceled')
    ) {
      event.stopImmediatePropagation?.();
      event.preventDefault?.();
      return;
    }
    const stack = reason instanceof Error ? reason.stack || '' : '';
    reportErrorToTelemetry(`Unhandled promise rejection: ${message}`, stack);
  };

  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onRejection);

  return () => {
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onRejection);
  };
}
