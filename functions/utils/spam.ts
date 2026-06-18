export function detectSpamHeuristics(body: any): boolean {
  // 1. Honeypot check — NEVER in schema, checked manually
  if (body.website !== undefined && String(body.website).trim().length > 0) return true;
  if (body.honeypot !== undefined && String(body.honeypot).trim().length > 0) return true;

  // 2. Normalize: lowercase, NFKC, remove zero-width chars
  const normalize = (s: string) =>
    s.normalize("NFKC")
      .toLowerCase()
      .replace(/[\u200B-\u200D\uFEFF]/g, "")  // zero-width chars
      .replace(/\s+/g, " ");

  const name = normalize(String(body.name || ""));
  const subject = normalize(String(body.subject || ""));
  const message = normalize(String(body.message || ""));
  const comment = normalize(String(body.comment || ""));
  const combined = `${name} ${subject} ${message} ${comment}`;

  // 3. Link abundance
  const linkMatches = combined.match(/https?:\/\/[^\s/$.?#].[^\s]*/gi);
  if (linkMatches && linkMatches.length > 3) return true;

  // 4. HTML/BBCode injection
  if (combined.includes("href=") || combined.includes("[url=") ||
      combined.includes("<a ") || combined.includes("</a>")) return true;

  // 5. Enhanced blocklist with normalized variants
  const blocklist = [
    "viagra", "v1agra", "v1@gra", "vi@gra",
    "cialis", "casino online", "cas1no", "c@asino",
    "poker bonus", "cryptocurrency investment", "crypto investment",
    "seo ranking boost", "unsecured loan", "adult dating",
    "free money payout", "earn massive passive income",
    "click here", "act now", "limited time", "100% free",
    "make money fast", "work from home", "weight loss",
    "debt relief", "credit repair", "lottery winner",
  ];

  for (const term of blocklist) {
    if (combined.includes(term)) return true;
  }

  // 6. Entropy check — very low entropy = likely spam pattern
  const uniqueChars = new Set(combined).size;
  if (combined.length > 50 && uniqueChars / combined.length < 0.15) return true;

  return false;
}
