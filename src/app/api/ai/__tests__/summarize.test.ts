import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "../summarize/route";

describe("ai summarize route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.OPENAI_API_KEY;
    delete process.env.AI_API_KEY;
  });

  it("returns heuristic summary when no API key", async () => {
    const req = new Request("http://localhost/api/ai/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "2024-01-15 Meeting with lawyer\n2024-02-20 Court hearing",
        locale: "de",
      }),
    });
    const res = await POST(req);
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json).toHaveProperty("items");
    expect(Array.isArray(json.items)).toBe(true);
    expect(json).toHaveProperty("notes");
  });

  it("extracts dates from text", async () => {
    const req = new Request("http://localhost/api/ai/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "15.01.2024 First meeting\n20 Feb 2024 Second meeting",
        locale: "de",
      }),
    });
    const res = await POST(req);
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json.items.length).toBeGreaterThan(0);
  });

  it("handles rate limiting", async () => {
    const req = new Request("http://localhost/api/ai/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Test", locale: "de" }),
    });
    for (let i = 0; i < 25; i++) {
      await POST(req);
    }
    const res = await POST(req);
    expect(res.status).toBe(429);
  });

  it("handles invalid request body", async () => {
    // Use a unique key to avoid rate limiting from previous tests
    const req = new Request("http://localhost/api/ai/summarize?unique=invalid", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.100" },
      body: "invalid json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
