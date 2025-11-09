import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "./route";

describe("translate API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.OPENAI_API_KEY;
    delete process.env.AI_API_KEY;
  });

  it("returns disabled response when no API key", async () => {
    const req = new Request("http://localhost/api/ai/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Hallo", to: "en", transliterate: true }),
    });
    const res = await POST(req);
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json).toHaveProperty("disabled", true);
    expect(json).toHaveProperty("text");
  });

  it("handles rate limiting", async () => {
    const req = new Request("http://localhost/api/ai/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Test", to: "en" }),
    });
    for (let i = 0; i < 35; i++) {
      await POST(req);
    }
    const res = await POST(req);
    expect(res.status).toBe(429);
  });

  it("handles invalid request body", async () => {
    const req = new Request("http://localhost/api/ai/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "invalid json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("handles missing text", async () => {
    const req = new Request("http://localhost/api/ai/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: "en" }),
    });
    const res = await POST(req);
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json).toHaveProperty("text");
  });
});
