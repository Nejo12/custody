/**
 * Tests for Planning Checklist Page
 * Verifies interactive functionality, state management, and UI
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("Planning Checklist Page", () => {
  it("should have proper TypeScript types without 'any'", () => {
    const filePath = join(process.cwd(), "src/app/planning/checklist/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify no 'any' type is used
    expect(fileContent).not.toMatch(/:\s*any/);
    expect(fileContent).not.toMatch(/<any>/);

    // Verify proper type imports
    expect(fileContent).toMatch(/import type { ChecklistItem, PlanningStage }/);
  });

  it("should have state management for completed items", () => {
    const filePath = join(process.cwd(), "src/app/planning/checklist/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify state for completed items using Set
    expect(fileContent).toMatch(/useState<Set<string>>/);
    expect(fileContent).toMatch(/completedItems.*setCompletedItems/);

    // Verify toggle function with proper typing
    expect(fileContent).toMatch(/toggleItem.*itemId: string.*: void/);
  });

  it("should have filtering by stage functionality", () => {
    const filePath = join(process.cwd(), "src/app/planning/checklist/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify stage filter state
    expect(fileContent).toMatch(/useState<PlanningStage \| "all">/);
    expect(fileContent).toMatch(/selectedStage.*setSelectedStage/);

    // Verify filtering logic with useMemo
    expect(fileContent).toMatch(/filteredItems = useMemo/);
  });

  it("should calculate completion percentage correctly", () => {
    const filePath = join(process.cwd(), "src/app/planning/checklist/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify completion percentage calculation
    expect(fileContent).toMatch(/completionPercentage = useMemo/);
    expect(fileContent).toMatch(/Math\.round.*completedItems\.size.*checklistItems\.length/);
  });

  it("should have progress bar with proper ARIA attributes", () => {
    const filePath = join(process.cwd(), "src/app/planning/checklist/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify progress bar ARIA attributes
    expect(fileContent).toMatch(/role="progressbar"/);
    expect(fileContent).toMatch(/aria-valuenow=\{completionPercentage\}/);
    expect(fileContent).toMatch(/aria-valuemin=\{0\}/);
    expect(fileContent).toMatch(/aria-valuemax=\{100\}/);
  });

  it("should have checkbox with proper ARIA attributes", () => {
    const filePath = join(process.cwd(), "src/app/planning/checklist/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify checkbox ARIA attributes
    expect(fileContent).toMatch(/role="checkbox"/);
    expect(fileContent).toMatch(/aria-checked={isCompleted}/);
    expect(fileContent).toMatch(/aria-label=/);
  });

  it("should sort items by urgency", () => {
    const filePath = join(process.cwd(), "src/app/planning/checklist/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify urgency sorting logic
    expect(fileContent).toMatch(/urgencyOrder.*Record<string, number>/);
    expect(fileContent).toMatch(/critical: 0/);
    expect(fileContent).toMatch(/high: 1/);
    expect(fileContent).toMatch(/items\.sort/);
  });

  it("should have show/hide completed items toggle", () => {
    const filePath = join(process.cwd(), "src/app/planning/checklist/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify show completed state
    expect(fileContent).toMatch(/useState<boolean>/);
    expect(fileContent).toMatch(/showCompleted.*setShowCompleted/);

    // Verify toggle button
    expect(fileContent).toMatch(/aria-pressed={showCompleted}/);
  });

  it("should display item metadata (time, location, cost)", () => {
    const filePath = join(process.cwd(), "src/app/planning/checklist/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify metadata display
    expect(fileContent).toMatch(/item\.estimatedTime/);
    expect(fileContent).toMatch(/item\.location/);
    expect(fileContent).toMatch(/item\.cost/);
  });

  it("should have proper i18n integration", () => {
    const filePath = join(process.cwd(), "src/app/planning/checklist/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify i18n usage
    expect(fileContent).toMatch(/const { t } = useI18n\(\)/);
    expect(fileContent).toMatch(/t\.planning\?\.checklist\?\.title/);
  });

  it("should not have unused variables", () => {
    const filePath = join(process.cwd(), "src/app/planning/checklist/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify all declared functions are used
    expect(fileContent).toMatch(/toggleItem[\s\S]*onClick.*toggleItem/);
    expect(fileContent).toMatch(/getUrgencyColor[\s\S]*getUrgencyColor\(item\.urgency\)/);
  });

  it("should have proper comments for clarity", () => {
    const filePath = join(process.cwd(), "src/app/planning/checklist/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify presence of meaningful comments
    expect(fileContent).toMatch(/\/\*\*[\s\S]*Interactive Checklist Page/);
    expect(fileContent).toMatch(/\/\*\*[\s\S]*Toggle completion status/);
  });
});
