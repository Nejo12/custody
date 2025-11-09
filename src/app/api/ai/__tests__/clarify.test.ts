import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "../clarify/route";

describe("clarify API", () => {
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

  it("returns fallback response when no API key", async () => {
    const req = new Request("http://localhost/api/ai/clarify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionText: "Test question",
        answers: {},
        locale: "de",
      }),
    });
    const res = await POST(req);
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json).toHaveProperty("suggestion", "unsure");
    expect(json).toHaveProperty("confidence");
    expect(json).toHaveProperty("followup");
  });

  it("handles rate limiting", async () => {
    const req = new Request("http://localhost/api/ai/clarify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: "test",
        answers: {},
      }),
    });
    for (let i = 0; i < 25; i++) {
      await POST(req);
    }
    const res = await POST(req);
    expect(res.status).toBe(429);
  });

  it("handles invalid request body", async () => {
    const req = new Request("http://localhost/api/ai/clarify?unique=invalid-body", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.20" },
      body: "invalid json",
    });
    const res = await POST(req);
    // May return 400 or 429 depending on rate limiting
    expect([400, 429]).toContain(res.status);
  });

  it("returns successful response with API key", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              suggestion: "yes",
              confidence: 0.8,
              followup: "Can you clarify?",
              reasoning: "Test reasoning",
            }),
          },
        },
      ],
    };
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 })
    );

    const req = new Request("http://localhost/api/ai/clarify?unique=success", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.10" },
      body: JSON.stringify({
        questionId: "test",
        answers: { key: "value" },
        locale: "de",
      }),
    });
    const res = await POST(req);
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json).toHaveProperty("suggestion", "yes");
    expect(json).toHaveProperty("confidence", 0.8);
  });

  it("handles API failure", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    vi.mocked(global.fetch).mockResolvedValueOnce(new Response("API Error", { status: 500 }));

    const req = new Request("http://localhost/api/ai/clarify?unique=api-fail", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.11" },
      body: JSON.stringify({
        questionId: "test",
        answers: {},
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json).toHaveProperty("error", "AI request failed");
  });

  it("handles unparsable response", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const mockResponse = {
      choices: [
        {
          message: {
            content: "not json",
          },
        },
      ],
    };
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 })
    );

    const req = new Request("http://localhost/api/ai/clarify?unique=unparsable", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.12" },
      body: JSON.stringify({
        questionId: "test",
        answers: {},
      }),
    });
    const res = await POST(req);
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json).toHaveProperty("suggestion", "unsure");
    expect(json).toHaveProperty("reasoning", "Unparsable model output.");
  });

  it("normalizes confidence to 0-1 range", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              suggestion: "yes",
              confidence: 1.5,
            }),
          },
        },
      ],
    };
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 })
    );

    const req = new Request("http://localhost/api/ai/clarify?unique=confidence", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.13" },
      body: JSON.stringify({
        questionId: "test",
        answers: {},
      }),
    });
    const res = await POST(req);
    const json = await res.json();
    expect(json.confidence).toBe(1);
  });

  it("normalizes invalid suggestion to unsure", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              suggestion: "maybe",
              confidence: 0.5,
            }),
          },
        },
      ],
    };
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 })
    );

    const req = new Request("http://localhost/api/ai/clarify?unique=invalid-suggestion", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.14" },
      body: JSON.stringify({
        questionId: "test",
        answers: {},
      }),
    });
    const res = await POST(req);
    const json = await res.json();
    expect(json.suggestion).toBe("unsure");
  });

  it("handles missing questionText in fallback", async () => {
    const req = new Request("http://localhost/api/ai/clarify?unique=missing-question", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.16" },
      body: JSON.stringify({
        questionId: "test",
        answers: {},
      }),
    });
    const res = await POST(req);
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json.followup).toContain("Bitte prüfen Sie die Hilfe");
  });

  it("handles context in request", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              suggestion: "no",
              confidence: 0.7,
            }),
          },
        },
      ],
    };
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 })
    );

    const req = new Request("http://localhost/api/ai/clarify?unique=context", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.15" },
      body: JSON.stringify({
        questionId: "test",
        answers: {},
        context: "Some context",
      }),
    });
    const res = await POST(req);
    expect(res.ok).toBe(true);
  });
});
