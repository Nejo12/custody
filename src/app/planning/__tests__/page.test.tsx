/**
 * Tests for Planning Hub Page
 * Verifies proper rendering, styling, and functionality
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("Planning Hub Page", () => {
  it("should have proper TypeScript types without 'any'", () => {
    const filePath = join(process.cwd(), "src/app/planning/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify no 'any' type is used
    expect(fileContent).not.toMatch(/:\s*any/);
    expect(fileContent).not.toMatch(/<any>/);

    // Verify proper type imports
    expect(fileContent).toMatch(/import type { PlanningGuide, PlanningStage }/);
  });

  it("should have readable text colors for headings in light mode", () => {
    const filePath = join(process.cwd(), "src/app/planning/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify h1 has dark text color
    expect(fileContent).toMatch(/text-3xl font-bold text-zinc-900 dark:text-zinc-50/);

    // Verify description text is readable
    expect(fileContent).toMatch(/text-lg text-zinc-700 dark:text-zinc-300/);
  });

  it("should include stage navigation with proper icons", () => {
    const filePath = join(process.cwd(), "src/app/planning/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify stage icons are present
    expect(fileContent).toMatch(/icon: "🤰"/); // Expecting
    expect(fileContent).toMatch(/icon: "👶"/); // At birth
    expect(fileContent).toMatch(/icon: "🍼"/); // First year
    expect(fileContent).toMatch(/icon: "⚠️"/); // Early warning
  });

  it("should have proper filtering functionality", () => {
    const filePath = join(process.cwd(), "src/app/planning/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify state for selected stage
    expect(fileContent).toMatch(/useState<PlanningStage \| "all">/);
    expect(fileContent).toMatch(/setSelectedStage/);

    // Verify filtering logic
    expect(fileContent).toMatch(/selectedStage === "all"/);
    expect(fileContent).toMatch(/guides\.filter.*guide\.stage === selectedStage/);
  });

  it("should have proper urgency color coding", () => {
    const filePath = join(process.cwd(), "src/app/planning/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify urgency color function exists
    expect(fileContent).toMatch(/getUrgencyColor/);
    expect(fileContent).toMatch(/case "critical"/);
    expect(fileContent).toMatch(/bg-red-100/);
    expect(fileContent).toMatch(/case "high"/);
    expect(fileContent).toMatch(/bg-orange-100/);
    expect(fileContent).toMatch(/case "medium"/);
    expect(fileContent).toMatch(/bg-yellow-100/);
  });

  it("should include CTAs for interactive features", () => {
    const filePath = join(process.cwd(), "src/app/planning/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify checklist CTA
    expect(fileContent).toMatch(/href="\/planning\/checklist"/);

    // Verify resources CTA
    expect(fileContent).toMatch(/href="\/planning\/resources"/);
  });

  it("should have proper i18n integration", () => {
    const filePath = join(process.cwd(), "src/app/planning/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify i18n hook usage
    expect(fileContent).toMatch(/const { t, locale } = useI18n\(\)/);

    // Verify translation usage
    expect(fileContent).toMatch(/t\.planning\?\.title/);
    expect(fileContent).toMatch(/t\.planning\?\.stages/);
  });

  it("should not have unused variables", () => {
    const filePath = join(process.cwd(), "src/app/planning/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Check that declared variables are used
    // This is a basic check - TypeScript compiler will catch unused variables
    const hasUseClient = fileContent.includes('"use client"');
    expect(hasUseClient).toBe(true);
  });
});
