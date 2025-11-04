import { describe, it, expect } from "vitest";
import { questions } from "@/data/questions";

describe("questionnaire", () => {
  it("has 12 questions max and required ids", () => {
    expect(questions.length).toBe(12);
    const ids = questions.map((q) => q.id);
    expect(ids).toContain("married_at_birth");
    expect(ids).toContain("parental_agreement_possible");
  });
});
