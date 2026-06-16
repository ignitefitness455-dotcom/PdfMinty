/**
 * PII-safe error sanitizer that scrubs sensitive information such as
 * email addresses, IP addresses, and file paths.
 */
export function scrubPii(text: string): string {
  if (!text) return text;

  let sanitized = text;

  // 1. Scrub Email Addresses
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  sanitized = sanitized.replace(emailRegex, "[EMAIL]");

  // 2. Scrub IP Addresses (IPv4 and simple IPv6)
  const ipv4Regex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
  sanitized = sanitized.replace(ipv4Regex, "[IP]");

  const ipv6Regex = /\b(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}\b/g;
  sanitized = sanitized.replace(ipv6Regex, "[IP]");

  // 3. Scrub Absolute/Physical File Paths or URL parameters carrying paths
  // Matches typical UNIX/Linux paths /root, /home, /var, /usr, /app, or workspace paths
  const unixPathRegex = /(?:\/[\w.-]+)+/g;
  // Let's protect standard web routes and file extensions but scrub deep file paths
  sanitized = sanitized.replace(unixPathRegex, (match) => {
    // Keep standard UI links or simple extensions but clean physical system paths
    if (
      match === "/" ||
      match.startsWith("/api/") ||
      match.match(/^\/[a-zA-Z0-9-]+$/) // e.g. /merge-pdf, /compress-pdf
    ) {
      return match;
    }
    return "[PATH]";
  });

  // Windows absolute paths
  const windowsPathRegex = /[a-zA-Z]:\\(?:[^\\/:*?"<>|\r\n]+\\)*[^\\/:*?"<>|\r\n]*/g;
  sanitized = sanitized.replace(windowsPathRegex, "[PATH]");

  return sanitized;
}

export function sanitizeError(err: any): { message: string; stack?: string } {
  if (!err) {
    return { message: "Unknown error" };
  }

  const rawMessage = err instanceof Error ? err.message : String(err);
  const rawStack = err instanceof Error ? err.stack : undefined;

  const message = scrubPii(rawMessage);
  const stack = rawStack ? scrubPii(rawStack) : undefined;

  return { message, stack };
}
