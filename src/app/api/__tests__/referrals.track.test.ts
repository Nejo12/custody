import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../referrals/track/route";

// Mock supabase insert
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({})),
    })),
  },
}));

// Mock rate limiting utilities
vi.mock("@/lib/ratelimit", () => ({
  getClientKey: vi.fn(() => "test-key"),
  rateLimit: vi.fn(() =>
    Promise.resolve({ allowed: true, remaining: 9, resetAt: Date.now() + 60000 })
  ),
  rateLimitResponse: vi.fn(() => ({})),
}));

describe("POST /api/referrals/track", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects missing required fields", async () => {
    const req = new NextRequest("http://localhost/api/referrals/track", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = (await res.json()) as { success: boolean; error?: string };
    expect(data.success).toBe(false);
    expect(data.error).toMatch(/landingPath|visitorId/i);
  });

  it("stores a valid referral event", async () => {
    const body = {
      landingPath: "/?utm_source=test",
      visitorId: "abc-123",
      source: "test",
    };
    const req = new NextRequest("http://localhost/api/referrals/track", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { success: boolean };
    expect(data.success).toBe(true);
  });

  it("returns 429 when rate limited", async () => {
    const { rateLimit } = await import("@/lib/ratelimit");
    vi.mocked(rateLimit).mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 60000,
    });

    const req = new NextRequest("http://localhost/api/referrals/track", {
      method: "POST",
      body: JSON.stringify({ landingPath: "/", visitorId: "x" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(429);
  });
});
