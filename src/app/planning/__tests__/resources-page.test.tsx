/**
 * Tests for Planning City Resources Page
 * Verifies search functionality, data display, and UI
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("Planning Resources Page", () => {
  it("should have proper TypeScript types without 'any'", () => {
    const filePath = join(process.cwd(), "src/app/planning/resources/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify no 'any' type is used
    expect(fileContent).not.toMatch(/:\s*any/);
    expect(fileContent).not.toMatch(/<any>/);

    // Verify proper type imports
    expect(fileContent).toMatch(/import type { CityResource }/);
  });

  it("should have search functionality with proper typing", () => {
    const filePath = join(process.cwd(), "src/app/planning/resources/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify search state
    expect(fileContent).toMatch(/useState<string>/);
    expect(fileContent).toMatch(/searchQuery.*setSearchQuery/);

    // Verify search input
    expect(fileContent).toMatch(/value={searchQuery}/);
    expect(fileContent).toMatch(/onChange.*setSearchQuery/);
  });

  it("should filter resources by city and postcode", () => {
    const filePath = join(process.cwd(), "src/app/planning/resources/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify filtering logic
    expect(fileContent).toMatch(/filteredResources/);
    expect(fileContent).toMatch(/cityResources\.filter/);
    expect(fileContent).toMatch(/resource\.city\.toLowerCase/);
    expect(fileContent).toMatch(/resource\.postcode\.includes/);
  });

  it("should display Standesamt information", () => {
    const filePath = join(process.cwd(), "src/app/planning/resources/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify Standesamt section
    expect(fileContent).toMatch(/🏛️/); // Icon
    expect(fileContent).toMatch(/cityResources\?\.standesamt\?\.title/);
    expect(fileContent).toMatch(/resource\.standesamt\.name/);
    expect(fileContent).toMatch(/resource\.standesamt\.address/);
  });

  it("should display Jugendamt information", () => {
    const filePath = join(process.cwd(), "src/app/planning/resources/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify Jugendamt section
    expect(fileContent).toMatch(/👥/); // Icon
    expect(fileContent).toMatch(/cityResources\?\.jugendamt\?\.title/);
    expect(fileContent).toMatch(/resource\.jugendamt\.name/);
    expect(fileContent).toMatch(/resource\.jugendamt\.address/);
  });

  it("should have contact information with proper links", () => {
    const filePath = join(process.cwd(), "src/app/planning/resources/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify phone link
    expect(fileContent).toMatch(/href={`tel:\${.*\.phone}`}/);

    // Verify email link
    expect(fileContent).toMatch(/href={`mailto:\${.*\.email}`}/);

    // Verify website link with target="_blank"
    expect(fileContent).toMatch(/target="_blank"/);
    expect(fileContent).toMatch(/rel="noopener noreferrer"/);
  });

  it("should display appointment requirement warning", () => {
    const filePath = join(process.cwd(), "src/app/planning/resources/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify appointment required badge
    expect(fileContent).toMatch(/appointmentRequired &&/);
    expect(fileContent).toMatch(/⚠️[\s\S]*?Appointment Required/);
  });

  it("should show no results message when filtered list is empty", () => {
    const filePath = join(process.cwd(), "src/app/planning/resources/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify no results handling
    expect(fileContent).toMatch(/filteredResources\.length > 0/);
    expect(fileContent).toMatch(/🔍/); // No results icon
    expect(fileContent).toMatch(/noResultsFound/);
  });

  it("should display special notes when available", () => {
    const filePath = join(process.cwd(), "src/app/planning/resources/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify notes section
    expect(fileContent).toMatch(/resource\.notes &&/);
    expect(fileContent).toMatch(/ℹ️/);
  });

  it("should have proper i18n integration", () => {
    const filePath = join(process.cwd(), "src/app/planning/resources/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify i18n usage
    expect(fileContent).toMatch(/const { t.*} = useI18n\(\)/);
    expect(fileContent).toMatch(/t\.planning\?\.cityResources\?\.title/);
    expect(fileContent).toMatch(/t\.planning\?\.cityResources\?\.standesamt/);
    expect(fileContent).toMatch(/t\.planning\?\.cityResources\?\.jugendamt/);
  });

  it("should have search input with proper accessibility", () => {
    const filePath = join(process.cwd(), "src/app/planning/resources/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify accessibility attributes
    expect(fileContent).toMatch(/aria-label="Search for city or postcode"/);
    expect(fileContent).toMatch(/placeholder/);
  });

  it("should not have unused variables", () => {
    const filePath = join(process.cwd(), "src/app/planning/resources/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify declared variables are used
    expect(fileContent).toMatch(/cityResources[\s\S]*cityResources\.filter/);
    expect(fileContent).toMatch(/filteredResources[\s\S]*filteredResources\.length/);
  });

  it("should have proper comments for clarity", () => {
    const filePath = join(process.cwd(), "src/app/planning/resources/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify presence of meaningful comments
    expect(fileContent).toMatch(/\/\*\*[\s\S]*City Resources Page/);
    expect(fileContent).toMatch(/\/\*\*[\s\S]*Filter resources based on search query/);
  });
});
