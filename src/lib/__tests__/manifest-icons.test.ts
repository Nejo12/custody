import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

type Icon = {
  src: string;
  type?: string;
  purpose?: string;
  sizes?: string;
};

type Manifest = {
  icons?: Icon[];
};

describe("manifest icons", () => {
  it("contains icons entries", () => {
    const p = path.join(process.cwd(), "public", "manifest.webmanifest");
    const json = JSON.parse(fs.readFileSync(p, "utf8")) as Manifest;
    expect(Array.isArray(json.icons)).toBe(true);
    expect(json.icons?.length).toBeGreaterThan(0);
    const first = json.icons?.[0];
    expect(first?.src).toBeDefined();
    expect(first?.type).toBeDefined();
    expect(json.icons?.some((i: Icon) => String(i.purpose || "").includes("maskable"))).toBe(true);
  });
});
