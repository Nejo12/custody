import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/revgeo/route";

describe("revgeo route", () => {
  it("returns 400 when missing lat/lon", async () => {
    const req = new Request("http://localhost/api/revgeo");
    const res = await GET(req as unknown as Request);
    expect(res.status).toBe(400);
    const j = await res.json();
    expect(j.error).toBeTruthy();
  });
});
