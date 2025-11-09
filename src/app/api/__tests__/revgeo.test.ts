import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET } from "@/app/api/revgeo/route";

describe("revgeo route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("returns 400 when missing lat/lon", async () => {
    const req = new Request("http://localhost/api/revgeo");
    const res = await GET(req);
    expect(res.status).toBe(400);
    const j = await res.json();
    expect(j.error).toBeTruthy();
  });

  it("returns 400 when missing lat", async () => {
    const req = new Request("http://localhost/api/revgeo?lon=10.0");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when missing lon", async () => {
    const req = new Request("http://localhost/api/revgeo?lat=52.5");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns successful response for Berlin", async () => {
    const mockResponse = {
      address: {
        postcode: "10179",
        city: "Berlin",
        state: "Berlin",
        "ISO3166-2-lvl4": "DE-BE",
      },
    };
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 })
    );

    const req = new Request("http://localhost/api/revgeo?lat=52.5&lon=13.4");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("postcode", "10179");
    expect(json).toHaveProperty("city", "berlin");
  });

  it("returns successful response for Hamburg", async () => {
    const mockResponse = {
      address: {
        postcode: "20355",
        city: "Hamburg",
        state: "Hamburg",
        "ISO3166-2-lvl4": "DE-HH",
      },
    };
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 })
    );

    const req = new Request("http://localhost/api/revgeo?lat=53.5&lon=10.0");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("city", "hamburg");
  });

  it("returns successful response for NRW", async () => {
    const mockResponse = {
      address: {
        postcode: "50667",
        city: "Köln",
        state: "Nordrhein-Westfalen",
        "ISO3166-2-lvl4": "DE-NW",
      },
    };
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 })
    );

    const req = new Request("http://localhost/api/revgeo?lat=50.9&lon=6.9");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("city", "nrw");
  });

  it("handles API failure", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(new Response("Error", { status: 500 }));

    const req = new Request("http://localhost/api/revgeo?lat=52.5&lon=13.4");
    const res = await GET(req);
    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json).toHaveProperty("error", "Reverse geocoding failed");
  });

  it("handles missing address in response", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 })
    );

    const req = new Request("http://localhost/api/revgeo?lat=52.5&lon=13.4");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("postcode", "");
  });

  it("handles exception", async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error("Network error"));

    const req = new Request("http://localhost/api/revgeo?lat=52.5&lon=13.4");
    const res = await GET(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json).toHaveProperty("error");
  });

  it("determines city from ISO code", async () => {
    const mockResponse = {
      address: {
        postcode: "10179",
        "ISO3166-2-lvl4": "DE-BE",
      },
    };
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 })
    );

    const req = new Request("http://localhost/api/revgeo?lat=52.5&lon=13.4");
    const res = await GET(req);
    const json = await res.json();
    expect(json).toHaveProperty("city", "berlin");
  });

  it("determines city from state name", async () => {
    const mockResponse = {
      address: {
        postcode: "50667",
        state: "Nordrhein-Westfalen",
      },
    };
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 })
    );

    const req = new Request("http://localhost/api/revgeo?lat=50.9&lon=6.9");
    const res = await GET(req);
    const json = await res.json();
    expect(json).toHaveProperty("city", "nrw");
  });
});
