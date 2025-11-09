import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/directory/route";

describe("directory API route", () => {
  it("returns services for berlin by default", async () => {
    const req = new Request("http://localhost/api/directory");
    const res = await GET(req);
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json).toHaveProperty("services");
    expect(Array.isArray(json.services)).toBe(true);
  });

  it("returns services for hamburg", async () => {
    const req = new Request("http://localhost/api/directory?city=hamburg");
    const res = await GET(req);
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json).toHaveProperty("services");
  });

  it("returns services for nrw", async () => {
    const req = new Request("http://localhost/api/directory?city=nrw");
    const res = await GET(req);
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json).toHaveProperty("services");
  });

  it("filters by type", async () => {
    const req = new Request("http://localhost/api/directory?city=berlin&type=lawyer");
    const res = await GET(req);
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json).toHaveProperty("services");
    if (json.services.length > 0) {
      expect(json.services[0]).toHaveProperty("type");
    }
  });

  it("handles case-insensitive city parameter", async () => {
    const req = new Request("http://localhost/api/directory?city=BERLIN");
    const res = await GET(req);
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json).toHaveProperty("services");
  });
});
