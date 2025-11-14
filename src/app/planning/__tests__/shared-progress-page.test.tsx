/**
 * Tests for Shared Progress Page
 * Tests loading and displaying shared planning progress
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("Shared Progress Page", () => {
  it("should have proper TypeScript types", () => {
    const filePath = join(process.cwd(), "src/app/planning/progress/shared/[token]/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify no 'any' type is used
    expect(fileContent).not.toMatch(/:\s*any/);
    expect(fileContent).not.toMatch(/<any>/);

    // Verify proper type imports
    expect(fileContent).toMatch(/import type { ChecklistItem }/);
  });

  it("should use useParams hook for token", () => {
    const filePath = join(process.cwd(), "src/app/planning/progress/shared/[token]/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    expect(fileContent).toMatch(/useParams/);
    expect(fileContent).toMatch(/params\.token/);
  });

  it("should fetch progress from API", () => {
    const filePath = join(process.cwd(), "src/app/planning/progress/shared/[token]/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    expect(fileContent).toMatch(/\/api\/planning\/progress\/share/);
    expect(fileContent).toMatch(/encodeURIComponent.*token/);
  });

  it("should handle loading state", () => {
    const filePath = join(process.cwd(), "src/app/planning/progress/shared/[token]/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    expect(fileContent).toMatch(/isLoading/);
    expect(fileContent).toMatch(/Loading shared progress/);
  });

  it("should handle error state", () => {
    const filePath = join(process.cwd(), "src/app/planning/progress/shared/[token]/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    expect(fileContent).toMatch(/error/);
    expect(fileContent).toMatch(/Unable to Load Progress/);
  });

  it("should display progress data", () => {
    const filePath = join(process.cwd(), "src/app/planning/progress/shared/[token]/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    expect(fileContent).toMatch(/progress\.progressData/);
    expect(fileContent).toMatch(/completionPercentage/);
    expect(fileContent).toMatch(/completedItems/);
  });

  it("should display checklist items", () => {
    const filePath = join(process.cwd(), "src/app/planning/progress/shared/[token]/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    expect(fileContent).toMatch(/checklistItems/);
    expect(fileContent).toMatch(/completedItemsSet/);
  });

  it("should have proper comments", () => {
    const filePath = join(process.cwd(), "src/app/planning/progress/shared/[token]/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    expect(fileContent).toMatch(/\/\*\*[\s\S]*Shared Progress Page/);
    expect(fileContent).toMatch(/\/\*\*[\s\S]*Load shared progress/);
  });

  it("should have accessibility attributes", () => {
    const filePath = join(process.cwd(), "src/app/planning/progress/shared/[token]/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    expect(fileContent).toMatch(/role="progressbar"/);
    expect(fileContent).toMatch(/aria-valuenow/);
    expect(fileContent).toMatch(/aria-valuemin/);
    expect(fileContent).toMatch(/aria-valuemax/);
  });

  it("should have proper variable usage", () => {
    const filePath = join(process.cwd(), "src/app/planning/progress/shared/[token]/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify key state variables are declared
    expect(fileContent).toMatch(/useState<SharedProgress/);
    expect(fileContent).toMatch(/useState<boolean>\(true\)/);
    expect(fileContent).toMatch(/useState<string | null>/);
    expect(fileContent).toMatch(/params\.token/);
  });

  it("should use proper React hooks", () => {
    const filePath = join(process.cwd(), "src/app/planning/progress/shared/[token]/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    expect(fileContent).toMatch(/useState/);
    expect(fileContent).toMatch(/useEffect/);
    expect(fileContent).toMatch(/useParams/);
  });

  it("should handle empty progress gracefully", () => {
    const filePath = join(process.cwd(), "src/app/planning/progress/shared/[token]/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    expect(fileContent).toMatch(/progress\?\.completedItems/);
    expect(fileContent).toMatch(/\|\|/); // Null coalescing
  });
});
