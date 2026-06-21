export function scrubPII(input: string): string {
  if (!input) return '';

  // 1. Email address pattern redirection
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

  // 2. IPv4 Address pattern redirection
  const ipv4Regex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;

  // 3. Unix/macOS personal home folders (e.g. /Users/john_doe or /home/john_doe)
  const unixHomeRegex = /(\/(?:Users|home)\/)[a-zA-Z0-9._-]+/g;

  // 4. Windows user profile directories (e.g. C:\Users\john_doe)
  const windowsHomeRegex = /([a-zA-Z]:\\Users\\)[a-zA-Z0-9._-]+/g;

  return input
    .replace(emailRegex, '[REDACTED_EMAIL]')
    .replace(ipv4Regex, '[REDACTED_IP]')
    .replace(unixHomeRegex, '$1[REDACTED_USER]')
    .replace(windowsHomeRegex, '$1[REDACTED_USER]');
}

export function reportErrorToTelemetry(message: string, stack: string) {
  const cleanMessage = scrubPII(message);
  const cleanStack = scrubPII(stack);

  fetch('/api/error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: cleanMessage,
      stack: cleanStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    }),
  }).catch(() => {});
}

export function setupErrorTelemetry() {
  window.addEventListener('error', (event) => {
    if (!event.message) return;
    reportErrorToTelemetry(event.message, event.error?.stack || '');
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message = reason instanceof Error ? reason.message : String(reason);
    const stack = reason instanceof Error ? reason.stack || '' : '';
    reportErrorToTelemetry(`Unhandled promise rejection: ${message}`, stack);
  });
}
