import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("PWA assets", () => {
  it("has a valid manifest", () => {
    const manifestPath = path.join(process.cwd(), "public", "manifest.webmanifest");
    const text = fs.readFileSync(manifestPath, "utf8");
    const json = JSON.parse(text);
    expect(json.name).toBeDefined();
    expect(json.start_url).toBe("/");
    expect(json.display).toBe("standalone");
  });

  it("has a service worker with install and fetch handlers", () => {
    const swPath = path.join(process.cwd(), "public", "sw.js");
    const text = fs.readFileSync(swPath, "utf8");
    expect(text).toMatch(/addEventListener\('install'/);
    expect(text).toMatch(/addEventListener\('fetch'/);
  });
});
