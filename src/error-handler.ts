// error-handler.ts — PII-safe client-side error reporting policy
function sanitizeErrorDetail(input: string): string {
  if (!input) return "";
  let text = input;
  // 1. Scrub email addresses
  text = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL]");
  // 2. Scrub IP addresses (v4)
  text = text.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, "[IP]");
  // 3. Scrub Windows file paths, e.g., C:\Users\Username
  text = text.replace(/[c-z]:\\users\\[a-z0-9_.-]+\\/gi, "C:\\Users\\[USER]\\");
  // 4. Scrub UNIX/Mac home paths, e.g., /Users/username/ or /home/username/
  text = text.replace(/\/(users|home)\/[a-z0-9_.-]+\//gi, "/$1/[USER]/");
  return text;
}

async function reportError(message: string, stack: string) {
  try {
    const cleanMessage = sanitizeErrorDetail(message);
    const cleanStack = sanitizeErrorDetail(stack);

    // Print sanitized version locally to protect browser logs from leakage
    console.error(`[PDFMinty][LOG] Sandboxed Error: ${cleanMessage}`);
    if (cleanStack) {
      console.error(`[PDFMinty][LOG] Sandboxed Stack: ${cleanStack}`);
    }

    // Send the anonymized telemetry report to the secure ingest endpoint
    await fetch("/api/error", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: cleanMessage,
        stack: cleanStack,
        timestamp: new Date().toISOString(),
        url: window.location.pathname,
      }),
    });
  } catch (err) {
    // Silent fail to avoid cascading loops
  }
}

window.addEventListener('error', (event) => {
  const message = event.message || (event.error && event.error.message) || 'Unknown error';
  const stack = (event.error && event.error.stack) || '';
  reportError(message, stack);
});

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const message = (reason instanceof Error ? reason.message : String(reason)) || 'Unhandled promise rejection';
  const stack = (reason instanceof Error ? reason.stack : '') || '';
  reportError(message, stack);
});
