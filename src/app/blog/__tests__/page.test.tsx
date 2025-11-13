import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Tests for BlogPage text readability improvements
 * Verifies that text colors are dark enough for light mode readability
 */
describe("BlogPage Text Readability", () => {
  it("has dark text colors for headings and titles in light mode", () => {
    // Read the actual source file to verify the changes
    const filePath = join(process.cwd(), "src/app/blog/page.tsx");
    const fileContent = readFileSync(filePath, "utf-8");

    // Verify h1 has dark text color
    expect(fileContent).toMatch(/h1.*text-zinc-900/);

    // Verify h2 titles have dark text color (not text-zinc-600)
    expect(fileContent).toMatch(/h2.*text-zinc-900/);
    expect(fileContent).not.toMatch(/h2.*text-zinc-600/);

    // Verify hover background is correct (not hover:bg-zinc-500)
    expect(fileContent).toMatch(/hover:bg-zinc-50/);
    expect(fileContent).not.toMatch(/hover:bg-zinc-500/);
  });
});
