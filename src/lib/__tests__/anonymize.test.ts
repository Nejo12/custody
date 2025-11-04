import { describe, it, expect } from "vitest";
import { anonymizeText, anonymizeObject } from "@/lib/anonymize";

describe("anonymize", () => {
  it("redacts emails, phones, addresses, postcodes, and names in text", () => {
    const input =
      "Email john.doe@example.com, phone +49 170 1234567, address Musterstraße 12, 10115 Berlin. Name: Max Mustermann";
    const out = anonymizeText(input);
    expect(out).not.toContain("john.doe@example.com");
    expect(out).not.toContain("170 1234567");
    expect(out).not.toContain("Musterstraße 12");
    expect(out).not.toContain("10115");
    expect(out).not.toContain("Max Mustermann");
  });

  it("recursively redacts strings in objects/arrays", () => {
    const obj = { a: "maria.mueller@mail.de", b: ["+49 30 123456", "Hauptstraße 99"] };
    const out = anonymizeObject(obj) as { a: string; b: string[] };
    expect(out.a).toContain("[REDACTED_EMAIL]");
    expect(out.b.join(" ")).toContain("[REDACTED_PHONE]");
    expect(out.b.join(" ")).toContain("[REDACTED_ADDRESS]");
  });
});
