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

  it("handles API key path with successful response", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    process.env.OPENAI_API_BASE = "https://api.openai.com/v1";

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({ text: "Neutralized text" }),
            },
          },
        ],
      }),
    });

    const req = new Request("http://localhost/api/ai/neutralize?unique=apikey", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.101" },
      body: JSON.stringify({
        text: "Test text",
        locale: "de",
        tone: "neutral",
      }),
    });
    const res = await POST(req);
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json).toHaveProperty("text");
    expect(json.text).toBe("Neutralized text");
  });

  it("handles API response with invalid JSON", async () => {
    process.env.OPENAI_API_KEY = "test-key";

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: "invalid json",
            },
          },
        ],
      }),
    });

    const req = new Request("http://localhost/api/ai/neutralize?unique=invalidjson", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.102" },
      body: JSON.stringify({
        text: "Test text",
        locale: "de",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json).toHaveProperty("error", "Invalid AI output");
  });

  it("handles API response with missing text field", async () => {
    process.env.OPENAI_API_KEY = "test-key";

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({ notText: "value" }),
            },
          },
        ],
      }),
    });

    const req = new Request("http://localhost/api/ai/neutralize?unique=missingtext", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.103" },
      body: JSON.stringify({
        text: "Test text",
        locale: "de",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(502);
  });

  it("handles API request failure", async () => {
    process.env.OPENAI_API_KEY = "test-key";

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    const req = new Request("http://localhost/api/ai/neutralize?unique=apifail", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.104" },
      body: JSON.stringify({
        text: "Test text",
        locale: "de",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(502);
  });
});
