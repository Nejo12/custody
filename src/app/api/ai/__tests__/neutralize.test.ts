import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "../neutralize/route";

describe("ai neutralize route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.OPENAI_API_KEY;
    delete process.env.AI_API_KEY;
  });

  it("returns anonymized text when no API key", async () => {
    const req = new Request("http://localhost/api/ai/neutralize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Test text with exclamation!!!" }),
    });
    const res = await POST(req);
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json).toHaveProperty("text");
    expect(json.text).not.toContain("!!!");
  });

  it("handles rate limiting", async () => {
    const req = new Request("http://localhost/api/ai/neutralize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Test" }),
    });
    // Make multiple requests to trigger rate limit
    for (let i = 0; i < 25; i++) {
      await POST(req);
    }
    const res = await POST(req);
    expect(res.status).toBe(429);
  });

  it("handles invalid request body", async () => {
    // Use a unique key to avoid rate limiting from previous tests
    const req = new Request("http://localhost/api/ai/neutralize?unique=invalid", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.100" },
      body: "invalid json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
