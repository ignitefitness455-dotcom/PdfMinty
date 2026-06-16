import { describe, it, expect, vi, beforeEach } from "vitest";
import { onRequest } from "../functions/api/contact";
import { checkRateLimit } from "../functions/utils/rateLimit";
import { detectSpamHeuristics } from "../functions/utils/spam";

// Mock the rateLimit and spam utility functions
vi.mock("../functions/utils/rateLimit", () => ({
  checkRateLimit: vi.fn(),
}));

vi.mock("../functions/utils/spam", () => ({
  detectSpamHeuristics: vi.fn(),
}));

describe("Cloudflare API: contact.ts Handler", () => {
  const mockKV = {
    put: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  };

  const createMockContext = (method: string, bodyData: any, headersList: Record<string, string> = {}) => {
    const request = new Request("https://pdfminty.com/api/contact", {
      method,
      headers: new Headers({
        "Content-Type": "application/json",
        "CF-Connecting-IP": "127.0.0.1",
        "User-Agent": "Mozilla/5.0 (Testbot)",
        ...headersList,
      }),
      body: method === "POST" ? JSON.stringify(bodyData) : undefined,
    });

    return {
      request,
      env: {
        PDFMINTY_KV: mockKV,
      },
      next: vi.fn(),
      functionPath: "/api/contact",
      data: {},
      params: {},
    } as any;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockKV.put.mockResolvedValue(undefined);
    mockKV.get.mockResolvedValue(null);
  });

  it("returns 405 Method Not Allowed for non-POST method types", async () => {
    const context = createMockContext("GET", {});
    const response = await onRequest(context);

    expect(response.status).toBe(405);
    const body = await response.json();
    expect(body).toEqual({
      success: false,
      error: "METHOD_NOT_ALLOWED",
      message: "Only POST requests are supported.",
    });
  });

  it("handles standard preflight OPTIONS requests", async () => {
    const context = createMockContext("OPTIONS", {});
    const response = await onRequest(context);

    expect(response.status).toBe(204);
  });

  it("successfully records and saves a valid contact inquiry", async () => {
    // 1. Mock rate limit - allowed
    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: true,
      remaining: 2,
      limit: 3,
      resetSeconds: 3600,
    });

    // 2. Mock spam heuristics - not spam
    vi.mocked(detectSpamHeuristics).mockReturnValue(false);

    const context = createMockContext("POST", {
      name: "Alice Smith",
      email: "alice@example.com",
      subject: "Feedback Inquiry",
      message: "This is a beautiful test message of appropriate length.",
    });

    const response = await onRequest(context);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe("Your inquiry has been successfully delivered.");

    // Verify KV persistence is called
    expect(mockKV.put).toHaveBeenCalled();
  });

  it("rejects request with 429 when rate limit is exceeded", async () => {
    // Mock rate limit - blocked
    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: false,
      remaining: 0,
      limit: 3,
      resetSeconds: 45,
    });

    const context = createMockContext("POST", {
      name: "Alice Smith",
      email: "alice@example.com",
      subject: "Feedback Inquiry",
      message: "This is a beautiful test message of appropriate length.",
    });

    const response = await onRequest(context);
    expect(response.status).toBe(429);

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe("TOO_MANY_REQUESTS");
    expect(body.message).toContain("45 seconds");
  });

  it("rejects request with 400 when spam heuristics flag the payload", async () => {
    // Mock rate limit - allowed
    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: true,
      remaining: 2,
      limit: 3,
      resetSeconds: 3600,
    });

    // Mock spam heuristics - IS SPAM
    vi.mocked(detectSpamHeuristics).mockReturnValue(true);

    const context = createMockContext("POST", {
      name: "SEO Spambot",
      email: "bot@spambox.xyz",
      subject: "Buy Cheap backlinks",
      message: "Earn passive income now from casino website href='http://spam.xyz'",
    });

    const response = await onRequest(context);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe("SPAM_DETECTED");
  });
});
