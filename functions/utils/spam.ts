/**
 * Performs honeypot validation and descriptive spam heuristic checks
 * on contact inquiries and feedback data submissions.
 */
export function detectSpamHeuristics(body: any): boolean {
  // 1. Honeypot field validation: If 'website', 'honeypot', or generic robot fields are populated, it's a bot
  if (body.website !== undefined && String(body.website).trim().length > 0) {
    return true;
  }
  if (body.honeypot !== undefined && String(body.honeypot).trim().length > 0) {
    return true;
  }

  const combinedText = `
    ${body.name || ""}
    ${body.subject || ""}
    ${body.message || ""}
    ${body.comment || ""}
  `.toLowerCase();

  // 2. Link abundance limit: Spambots submit blocks of links to inject SEO backlinks
  const linkMatches = combinedText.match(/https?:\/\/[^\s/$.?#].[^\s]*/gi);
  if (linkMatches && linkMatches.length > 3) {
    return true;
  }

  // Common bot BBCode or HTML injection check
  if (
    combinedText.includes("href=") ||
    combinedText.includes("[url=") ||
    combinedText.includes("<a ") ||
    combinedText.includes("</a>")
  ) {
    return true;
  }

  // 3. Spambot phrases / illegal keywords
  const blocklist = [
    "viagra",
    "cialis",
    "casino online",
    "poker bonus",
    "cryptocurrency investment",
    "seo ranking boost",
    "unsecured loan",
    "adult dating",
    "free money payout",
    "earn massive passive income"
  ];

  for (const term of blocklist) {
    if (combinedText.includes(term)) {
      return true;
    }
  }

  return false;
}
