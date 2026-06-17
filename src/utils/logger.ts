// Sanitizing Offline-Friendly Logger

export const logger = {
  info: (message: string, ...args: any[]) => {
    console.info(`[PDFMinty-Info] ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[PDFMinty-Warn] ${message}`, ...args);
  },
  error: (message: string, error?: any, ...args: any[]) => {
    const rawMsg = error instanceof Error ? error.message : String(error || "");
    const sanitizedMsg = rawMsg
      .replace(/[\w.-]+@[\w.-]+\.\w+/g, "[EMAIL_REDACTED]")
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, "[IP_REDACTED]")
      .replace(/\/home\/[^\s]+/g, "[PATH_REDACTED]");
    console.error(`[PDFMinty-Error] ${message} - Details: ${sanitizedMsg}`, ...args);
  }
};
export default logger;
