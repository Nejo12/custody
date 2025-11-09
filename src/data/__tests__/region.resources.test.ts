import { describe, it, expect } from "vitest";
import { regionCitations, type RegionKey } from "../region.resources";

describe("region.resources", () => {
  it("exports regionCitations", () => {
    expect(regionCitations).toBeDefined();
    expect(typeof regionCitations).toBe("object");
  });

  it("has citations for all regions", () => {
    const regions: RegionKey[] = [
      "berlin",
      "hamburg",
      "nrw",
      "bayern",
      "bw",
      "hessen",
      "sachsen",
      "niedersachsen",
      "rlp",
      "sh",
      "bremen",
      "saarland",
      "brandenburg",
      "mv",
      "thueringen",
    ];
    regions.forEach((region) => {
      expect(regionCitations[region]).toBeDefined();
      expect(Array.isArray(regionCitations[region])).toBe(true);
      expect(regionCitations[region].length).toBeGreaterThan(0);
    });
  });

  it("each citation has label and url", () => {
    Object.values(regionCitations).forEach((citations) => {
      citations.forEach((citation) => {
        expect(citation).toHaveProperty("label");
        expect(citation).toHaveProperty("url");
        expect(typeof citation.label).toBe("string");
        expect(typeof citation.url).toBe("string");
      });
    });
  });

  it("berlin has expected citations", () => {
    const berlin = regionCitations.berlin;
    expect(berlin.length).toBeGreaterThan(0);
    expect(berlin.some((c) => c.label.includes("Berlin"))).toBe(true);
  });
});
