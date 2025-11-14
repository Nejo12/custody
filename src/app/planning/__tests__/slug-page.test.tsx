/**
 * Tests for Planning Guide Detail Page ([slug])
 * Verifies proper rendering, typing, and content display
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("Planning Guide Detail Page", () => {
  it("should have proper TypeScript types without 'any'", () => {
    const filePath = join(process.cwd(), "src/app/planning/[slug]/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify no 'any' type is used
    expect(fileContent).not.toMatch(/:\s*any(?!where)/); // Exclude "anywhere" in comments
    expect(fileContent).not.toMatch(/<any>/);

    // Verify proper type imports
    expect(fileContent).toMatch(/import type { PlanningGuide }/);
  });

  it("should have markdown rendering functionality", () => {
    const filePath = join(process.cwd(), "src/app/planning/[slug]/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify markdown rendering exists
    expect(fileContent).toMatch(/renderedContent/);
    expect(fileContent).toMatch(/useMemo/);

    // Verify heading support
    expect(fileContent).toMatch(/startsWith\("## "\)/);
    expect(fileContent).toMatch(/startsWith\("### "\)/);

    // Verify list support
    expect(fileContent).toMatch(/startsWith\("- "\)/);
    expect(fileContent).toMatch(/match\(\/\^\\d\+\\. \/\)/);
  });

  it("should display required documents section", () => {
    const filePath = join(process.cwd(), "src/app/planning/[slug]/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify required documents rendering
    expect(fileContent).toMatch(/guide\.requiredDocuments/);
    expect(fileContent).toMatch(/requiredDocuments/);
  });

  it("should have urgency badge with proper colors", () => {
    const filePath = join(process.cwd(), "src/app/planning/[slug]/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify urgency color function with proper TypeScript typing
    expect(fileContent).toMatch(/getUrgencyColor.*urgency: string.*: string/s);
    expect(fileContent).toMatch(/case "critical"/);
    expect(fileContent).toMatch(/bg-red-100/);
    expect(fileContent).toMatch(/case "high"/);
    expect(fileContent).toMatch(/bg-orange-100/);
  });

  it("should have floating back button with scroll threshold", () => {
    const filePath = join(process.cwd(), "src/app/planning/[slug]/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify scroll threshold hook
    expect(fileContent).toMatch(/useScrollThreshold\(200\)/);
    expect(fileContent).toMatch(/showFloatingButton/);

    // Verify conditional rendering of floating button
    expect(fileContent).toMatch(/showFloatingButton &&/);
  });

  it("should have proper i18n integration", () => {
    const filePath = join(process.cwd(), "src/app/planning/[slug]/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify i18n usage
    expect(fileContent).toMatch(/const { t, locale } = useI18n\(\)/);
    expect(fileContent).toMatch(/t\.planning\?\.backToPlanning/);
    expect(fileContent).toMatch(/t\.planning\?\.guideDisclaimer/);
  });

  it("should handle 404 for non-existent guides", () => {
    const filePath = join(process.cwd(), "src/app/planning/[slug]/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify notFound import and usage
    expect(fileContent).toMatch(/import.*notFound.*from "next\/navigation"/);
    expect(fileContent).toMatch(/if \(!guide\) {[\s\S]*notFound\(\)/);
  });

  it("should have related actions CTAs", () => {
    const filePath = join(process.cwd(), "src/app/planning/[slug]/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify CTAs for checklist and resources
    expect(fileContent).toMatch(/href="\/planning\/checklist"/);
    expect(fileContent).toMatch(/href="\/planning\/resources"/);
  });

  it("should have proper comments for code clarity", () => {
    const filePath = join(process.cwd(), "src/app/planning/[slug]/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify presence of meaningful comments
    expect(fileContent).toMatch(/\/\*\*/); // JSDoc comments
    expect(fileContent).toMatch(/Render markdown-like content/);
    expect(fileContent).toMatch(/Resolve params promise/);
  });
});
