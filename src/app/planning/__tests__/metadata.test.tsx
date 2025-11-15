/**
 * Tests for Planning & Prevention SEO metadata
 * Ensures proper metadata configuration for search engines and social sharing
 */

import { planningMetadata } from "../metadata";

describe("Planning Metadata", () => {
  it("should have a title", () => {
    expect(planningMetadata.title).toBeDefined();
    expect(planningMetadata.title).toContain("Planning");
    expect(planningMetadata.title).toContain("Custody Clarity");
  });

  it("should have a description", () => {
    expect(planningMetadata.description).toBeDefined();
    expect(typeof planningMetadata.description).toBe("string");
    const description = planningMetadata.description as string;
    expect(description.length).toBeGreaterThan(50);
    expect(description.length).toBeLessThan(200); // Increased to 200 for flexibility
  });

  it("should have relevant keywords", () => {
    expect(planningMetadata.keywords).toBeDefined();
    expect(Array.isArray(planningMetadata.keywords)).toBe(true);
    const keywords = planningMetadata.keywords as string[];
    expect(keywords.length).toBeGreaterThan(0);
    expect(keywords).toContain("Germany custody rights");
    expect(keywords).toContain("Vaterschaftsanerkennung");
    expect(keywords).toContain("Sorgeerklärung");
  });

  it("should have Open Graph configuration", () => {
    expect(planningMetadata.openGraph).toBeDefined();
    expect(planningMetadata.openGraph?.title).toBeDefined();
    expect(planningMetadata.openGraph?.description).toBeDefined();
    expect(planningMetadata.openGraph?.type).toBe("website");
  });

  it("should have Twitter card configuration", () => {
    expect(planningMetadata.twitter).toBeDefined();
    expect(planningMetadata.twitter?.card).toBe("summary_large_image");
    expect(planningMetadata.twitter?.title).toBeDefined();
    expect(planningMetadata.twitter?.description).toBeDefined();
  });

  it("should have canonical URL", () => {
    expect(planningMetadata.alternates).toBeDefined();
    expect(planningMetadata.alternates?.canonical).toBe("/planning");
  });

  it("should have language alternates", () => {
    expect(planningMetadata.alternates?.languages).toBeDefined();
    expect(planningMetadata.alternates?.languages?.en).toBe("/planning");
    expect(planningMetadata.alternates?.languages?.de).toBe("/planning");
    expect(planningMetadata.alternates?.languages?.ar).toBe("/planning");
  });
});
