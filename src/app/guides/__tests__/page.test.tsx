import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Tests for GuidesPage text readability improvements
 * Verifies that text colors are dark enough for light mode readability
 */
describe("GuidesPage Text Readability", () => {
  it("has dark text colors for headings and descriptions in light mode", () => {
    // Read the actual source file to verify the changes
    const filePath = join(process.cwd(), "src/app/guides/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify h1 has dark text color
    expect(fileContent).toMatch(/h1.*text-zinc-900/);

    // Verify description paragraph has readable text color
    expect(fileContent).toMatch(/text-sm text-zinc-700 dark:text-zinc-400/);

    // Verify guide excerpt has readable text color (not text-zinc-600)
    expect(fileContent).toMatch(/text-sm text-zinc-700 dark:text-zinc-400 mb-3.*excerpt/);
    expect(fileContent).not.toMatch(/excerpt.*text-zinc-600/);
  });
});
