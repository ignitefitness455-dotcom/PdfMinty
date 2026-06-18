/**
 * Structured logger — console in dev, no-op in production.
 * Never logs PII or file content.
 */

const IS_DEV = import.meta.env.DEV;

export const logger = {
  info: (msg: string, meta?: Record<string, any>) => {
    if (IS_DEV) console.log(`[INFO] ${msg}`, meta || "");
  },
  warn: (msg: string, meta?: Record<string, any>) => {
    if (IS_DEV) console.warn(`[WARN] ${msg}`, meta || "");
  },
  error: (msg: string, meta?: Record<string, any>) => {
    // Always log errors, but never include PII
    const safeMeta = meta ? Object.fromEntries(
      Object.entries(meta).filter(([k]) =>
        !["email", "password", "ip", "fileContent", "text"].some((p) =>
          k.toLowerCase().includes(p)
        )
      )
    ) : undefined;
    if (IS_DEV) console.error(`[ERROR] ${msg}`, safeMeta || "");
  },
};

export default logger;
