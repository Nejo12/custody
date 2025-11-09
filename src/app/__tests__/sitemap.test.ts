import { describe, it, expect } from "vitest";
import sitemap from "../sitemap";

describe("sitemap", () => {
  it("returns sitemap with correct structure", () => {
    const result = sitemap();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("includes home page with highest priority", () => {
    const result = sitemap();
    const home = result.find((item) => item.url === "https://custodyclarity.com");
    expect(home).toBeDefined();
    expect(home?.priority).toBe(1);
    expect(home?.changeFrequency).toBe("weekly");
  });

  it("includes all expected pages", () => {
    const result = sitemap();
    const urls = result.map((item) => item.url);
    expect(urls).toContain("https://custodyclarity.com");
    expect(urls).toContain("https://custodyclarity.com/interview");
    expect(urls).toContain("https://custodyclarity.com/result");
    expect(urls).toContain("https://custodyclarity.com/learn");
    expect(urls).toContain("https://custodyclarity.com/directory");
    expect(urls).toContain("https://custodyclarity.com/vault");
    expect(urls).toContain("https://custodyclarity.com/settings");
    expect(urls).toContain("https://custodyclarity.com/pdf/gemeinsame-sorge");
    expect(urls).toContain("https://custodyclarity.com/pdf/umgangsregelung");
    expect(urls).toContain("https://custodyclarity.com/glossary");
    expect(urls).toContain("https://custodyclarity.com/faq");
    expect(urls).toContain("https://custodyclarity.com/guides");
    expect(urls).toContain("https://custodyclarity.com/impressum");
    expect(urls).toContain("https://custodyclarity.com/datenschutz");
  });

  it("all entries have lastModified date", () => {
    const result = sitemap();
    result.forEach((item) => {
      expect(item.lastModified).toBeInstanceOf(Date);
    });
  });

  it("priorities are in valid range", () => {
    const result = sitemap();
    result.forEach((item) => {
      expect(item.priority).toBeGreaterThanOrEqual(0);
      expect(item.priority).toBeLessThanOrEqual(1);
    });
  });
});
