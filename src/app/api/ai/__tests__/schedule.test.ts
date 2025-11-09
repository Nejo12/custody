import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "../schedule/route";

describe("ai schedule route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.OPENAI_API_KEY;
    delete process.env.AI_API_KEY;
  });

  it("returns fallback schedule for local distance when no API key", async () => {
    const req = new Request("http://localhost/api/ai/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        distance: "local",
        childUnderThree: false,
        locale: "de",
      }),
    });
    const res = await POST(req);
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json).toHaveProperty("weekday");
    expect(json).toHaveProperty("weekend");
    expect(json).toHaveProperty("handover");
    expect(json).toHaveProperty("summary");
  });

  it("returns fallback schedule for child under three", async () => {
    const req = new Request("http://localhost/api/ai/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        distance: "local",
        childUnderThree: true,
        locale: "de",
      }),
    });
    const res = await POST(req);
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json.weekday).toHaveProperty("tuesday");
  });

  it("returns fallback schedule for regional distance", async () => {
    const req = new Request("http://localhost/api/ai/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        distance: "regional",
        childUnderThree: false,
        locale: "de",
      }),
    });
    const res = await POST(req);
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json.weekday).toHaveProperty("friday");
  });

  it("returns fallback schedule for far distance", async () => {
    const req = new Request("http://localhost/api/ai/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        distance: "far",
        childUnderThree: false,
        locale: "de",
      }),
    });
    const res = await POST(req);
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json.weekend).toHaveProperty("even");
  });

  it("handles rate limiting", async () => {
    const req = new Request("http://localhost/api/ai/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ distance: "local", locale: "de" }),
    });
    for (let i = 0; i < 25; i++) {
      await POST(req);
    }
    const res = await POST(req);
    expect(res.status).toBe(429);
  });

  it("handles invalid request body", async () => {
    // Use a unique key to avoid rate limiting from previous tests
    const req = new Request("http://localhost/api/ai/schedule?unique=invalid", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.100" },
      body: "invalid json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("includes city in prompt when provided", async () => {
    const req = new Request("http://localhost/api/ai/schedule?unique=city", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.101" },
      body: JSON.stringify({
        distance: "local",
        childUnderThree: false,
        locale: "de",
        city: "berlin",
      }),
    });
    const res = await POST(req);
    expect(res.ok).toBe(true);
  });

  it("includes courtName in prompt when provided", async () => {
    const req = new Request("http://localhost/api/ai/schedule?unique=court", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.102" },
      body: JSON.stringify({
        distance: "local",
        childUnderThree: false,
        locale: "de",
        courtName: "Amtsgericht Berlin",
      }),
    });
    const res = await POST(req);
    expect(res.ok).toBe(true);
  });

  it("includes workHours in prompt when provided", async () => {
    const req = new Request("http://localhost/api/ai/schedule?unique=work", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.103" },
      body: JSON.stringify({
        distance: "local",
        childUnderThree: false,
        locale: "de",
        workHours: "9-17",
      }),
    });
    const res = await POST(req);
    expect(res.ok).toBe(true);
  });

  it("includes specialNotes in prompt when provided", async () => {
    const req = new Request("http://localhost/api/ai/schedule?unique=notes", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.104" },
      body: JSON.stringify({
        distance: "local",
        childUnderThree: false,
        locale: "de",
        specialNotes: "Special circumstances",
      }),
    });
    const res = await POST(req);
    expect(res.ok).toBe(true);
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
              content: JSON.stringify({
                weekday: { monday: "16:00-19:00" },
                weekend: { even: "—", odd: "—" },
                handover: { location: "Test", notes: "Test" },
                summary: "Test summary",
              }),
            },
          },
        ],
      }),
    });

    const req = new Request("http://localhost/api/ai/schedule?unique=apikey", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.105" },
      body: JSON.stringify({
        distance: "local",
        childUnderThree: false,
        locale: "de",
      }),
    });
    const res = await POST(req);
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json).toHaveProperty("weekday");
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

    const req = new Request("http://localhost/api/ai/schedule?unique=invalidjson", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.106" },
      body: JSON.stringify({
        distance: "local",
        childUnderThree: false,
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

    const req = new Request("http://localhost/api/ai/schedule?unique=apifail", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.107" },
      body: JSON.stringify({
        distance: "local",
        childUnderThree: false,
        locale: "de",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(502);
  });

  it("handles API response with null parsed result", async () => {
    process.env.OPENAI_API_KEY = "test-key";

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: "null",
            },
          },
        ],
      }),
    });

    const req = new Request("http://localhost/api/ai/schedule?unique=nullparsed", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.108" },
      body: JSON.stringify({
        distance: "local",
        childUnderThree: false,
        locale: "de",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(502);
  });

  it("handles API response with non-object parsed result", async () => {
    process.env.OPENAI_API_KEY = "test-key";

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: '"string"',
            },
          },
        ],
      }),
    });

    const req = new Request("http://localhost/api/ai/schedule?unique=stringparsed", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.109" },
      body: JSON.stringify({
        distance: "local",
        childUnderThree: false,
        locale: "de",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(502);
  });
});
