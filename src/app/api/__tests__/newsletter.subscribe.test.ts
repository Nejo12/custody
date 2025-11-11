import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../newsletter/subscribe/route";

// Mock supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(),
        })),
      })),
      insert: vi.fn(() => ({
        // Return mock insert result
      })),
    })),
  },
}));

// Mock rate limiting
vi.mock("@/lib/ratelimit", () => ({
  getClientKey: vi.fn(() => "test-key"),
  rateLimit: vi.fn(() =>
    Promise.resolve({ allowed: true, remaining: 5, resetAt: Date.now() + 3600000 })
  ),
  rateLimitResponse: vi.fn(() => ({})),
}));

describe("POST /api/newsletter/subscribe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 for invalid email", async () => {
    const req = new NextRequest("http://localhost/api/newsletter/subscribe", {
      method: "POST",
      body: JSON.stringify({ email: "invalid-email" }),
    });

    const response = await POST(req);
    const data = (await response.json()) as { success: boolean; error?: string };

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("Valid email");
  });

  it("should return 400 for missing email", async () => {
    const req = new NextRequest("http://localhost/api/newsletter/subscribe", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(req);
    const data = (await response.json()) as { success: boolean; error?: string };

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it("should handle rate limiting", async () => {
    const { rateLimit } = await import("@/lib/ratelimit");
    vi.mocked(rateLimit).mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 3600000,
    });

    const req = new NextRequest("http://localhost/api/newsletter/subscribe", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const response = await POST(req);
    expect(response.status).toBe(429);
  });
});
