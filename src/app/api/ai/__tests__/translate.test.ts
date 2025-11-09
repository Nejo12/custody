import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "../translate/route";

describe("translate API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.OPENAI_API_KEY;
    delete process.env.AI_API_KEY;
    delete process.env.OPENAI_API_BASE;
    delete process.env.AI_API_BASE;
    delete process.env.OPENAI_MODEL;
    delete process.env.AI_MODEL;
    global.fetch = vi.fn();
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
    expect(json).toHaveProperty("transliteration");
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
    // Create a request that will fail when json() is called
    const req = new Request("http://localhost/api/ai/translate?unique=invalid-body", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.6" },
      body: "invalid json",
    });
    // The route will try to parse JSON and catch the error
    const res = await POST(req);
    // The route catches JSON parse errors and returns 400
    expect(res.status).toBe(400);
  });

  it("handles missing text", async () => {
    const req = new Request("http://localhost/api/ai/translate?unique=missing-text", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.7" },
      body: JSON.stringify({ to: "en" }),
    });
    const res = await POST(req);
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json).toHaveProperty("text", "");
  });

  it("translates text successfully with API key", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({ text: "Hello", transliteration: "" }),
          },
        },
      ],
    };
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 })
    );

    const req = new Request("http://localhost/api/ai/translate?unique=success", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.4" },
      body: JSON.stringify({ text: "Hallo", to: "en" }),
    });
    const res = await POST(req);
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json).toHaveProperty("text", "Hello");
    expect(json).toHaveProperty("transliteration", "");
  });

  it("handles transliteration when requested", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({ text: "مرحبا", transliteration: "marhaba" }),
          },
        },
      ],
    };
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 })
    );

    const req = new Request("http://localhost/api/ai/translate?unique=transliterate", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.5" },
      body: JSON.stringify({ text: "Hello", to: "ar", transliterate: true }),
    });
    const res = await POST(req);
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json).toHaveProperty("transliteration", "marhaba");
  });

  it("handles API failure", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    vi.mocked(global.fetch).mockResolvedValueOnce(new Response("API Error", { status: 500 }));

    const req = new Request("http://localhost/api/ai/translate?unique=api-fail", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.1" },
      body: JSON.stringify({ text: "Test", to: "en" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json).toHaveProperty("error");
  });

  it("handles default language when to is missing", async () => {
    const req = new Request("http://localhost/api/ai/translate?unique=default-lang", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.2" },
      body: JSON.stringify({ text: "Test" }),
    });
    const res = await POST(req);
    expect(res.ok).toBe(true);
  });

  it("handles invalid JSON response from API", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const mockResponse = {
      choices: [
        {
          message: {
            content: "invalid json",
          },
        },
      ],
    };
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 })
    );

    const req = new Request("http://localhost/api/ai/translate?unique=invalid-json", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.3" },
      body: JSON.stringify({ text: "Test", to: "en" }),
    });
    const res = await POST(req);
    // Should handle JSON parse error gracefully - may return 400 or 200 with fallback
    expect([200, 400]).toContain(res.status);
  });
});
