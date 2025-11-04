import { describe, it, expect } from "vitest";
import rules from "@/data/rules.json";
import type { SimpleRule, Outcome } from "@/lib/rules";

describe("rules citations", () => {
  it("every rule has at least one citation with a URL", () => {
    (rules as SimpleRule[]).forEach((r) => {
      expect(r.outcome).toBeDefined();
      const c = r.outcome.citations as Outcome["citations"];
      expect(c, `rule ${r.id} missing citations`).toBeDefined();
      expect(Array.isArray(c)).toBe(true);
      expect(c!.length).toBeGreaterThan(0);
      const first = (c as (string | { url: string })[])[0];
      expect(typeof first === "string" ? first.length > 0 : !!first.url).toBeTruthy();
    });
  });
});
