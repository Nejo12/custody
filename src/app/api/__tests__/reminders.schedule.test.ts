import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../reminders/schedule/route";

// Mock supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  },
}));

// Mock rate limiting
vi.mock("@/lib/ratelimit", () => ({
  getClientKey: vi.fn(() => "test-key"),
  rateLimit: vi.fn(() =>
    Promise.resolve({ allowed: true, remaining: 10, resetAt: Date.now() + 3600000 })
  ),
  rateLimitResponse: vi.fn(() => ({})),
}));

describe("POST /api/reminders/schedule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 for invalid email", async () => {
    const req = new NextRequest("http://localhost/api/reminders/schedule", {
      method: "POST",
      body: JSON.stringify({
        email: "invalid-email",
        reminderDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        summary: "Test reminder",
      }),
    });

    const response = await POST(req);
    const data = (await response.json()) as { success: boolean; error?: string };

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("Valid email");
  });

  it("should return 400 for past date", async () => {
    const req = new NextRequest("http://localhost/api/reminders/schedule", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        reminderDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        summary: "Test reminder",
      }),
    });

    const response = await POST(req);
    const data = (await response.json()) as { success: boolean; error?: string };

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("future");
  });

  it("should return 400 for missing summary", async () => {
    const req = new NextRequest("http://localhost/api/reminders/schedule", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        reminderDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        summary: "",
      }),
    });

    const response = await POST(req);
    const data = (await response.json()) as { success: boolean; error?: string };

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("Summary");
  });

  it("should handle rate limiting", async () => {
    const { rateLimit } = await import("@/lib/ratelimit");
    vi.mocked(rateLimit).mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 3600000,
    });

    const req = new NextRequest("http://localhost/api/reminders/schedule", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        reminderDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        summary: "Test reminder",
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(429);
  });
});
