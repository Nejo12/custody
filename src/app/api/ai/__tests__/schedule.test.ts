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
});
