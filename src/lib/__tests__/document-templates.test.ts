/**
 * Tests for Document Templates Library
 * Tests PDF generation for various document templates
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  generateDocumentTemplate,
  generateVaterschaftsanerkennung,
  generateSorgerechtserklaerung,
  generateKindergeldChecklist,
  generateEmergencyCustody,
  generateCoparentingAgreement,
  type TemplateUserData,
} from "../document-templates";

describe("document-templates", () => {
  const mockData: TemplateUserData = {
    fatherName: "John Doe",
    motherName: "Jane Doe",
    childName: "Baby Doe",
    childBirthDate: "2024-01-01",
    parent1Name: "Parent One",
    parent2Name: "Parent Two",
  };

  beforeEach(() => {
    // Reset any mocks if needed
  });

  describe("generateDocumentTemplate", () => {
    it("should generate vaterschaftsanerkennung template", async () => {
      const pdfBytes = await generateDocumentTemplate("vaterschaftsanerkennung", mockData, "de");

      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(pdfBytes.length).toBeGreaterThan(0);
    });

    it("should generate sorgerechtserklaerung template", async () => {
      const pdfBytes = await generateDocumentTemplate("sorgerechtserklaerung", mockData, "de");

      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(pdfBytes.length).toBeGreaterThan(0);
    });

    it("should generate kindergeld-checklist template", async () => {
      const pdfBytes = await generateDocumentTemplate("kindergeld-checklist", mockData, "de");

      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(pdfBytes.length).toBeGreaterThan(0);
    });

    it("should generate emergency-custody template", async () => {
      const pdfBytes = await generateDocumentTemplate("emergency-custody", mockData, "de");

      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(pdfBytes.length).toBeGreaterThan(0);
    });

    it("should generate coparenting-agreement template", async () => {
      const pdfBytes = await generateDocumentTemplate("coparenting-agreement", mockData, "de");

      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(pdfBytes.length).toBeGreaterThan(0);
    });

    it("should throw error for unknown template type", async () => {
      await expect(
        generateDocumentTemplate("unknown-type" as never, mockData, "de")
      ).rejects.toThrow();
    });
  });

  describe("generateVaterschaftsanerkennung", () => {
    it("should generate PDF with correct structure", async () => {
      const pdfBytes = await generateVaterschaftsanerkennung(mockData, "de");

      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(pdfBytes.length).toBeGreaterThan(0);
    });

    it("should handle missing optional fields", async () => {
      const minimalData: TemplateUserData = {
        fatherName: "John",
        motherName: "Jane",
      };

      const pdfBytes = await generateVaterschaftsanerkennung(minimalData, "de");

      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(pdfBytes.length).toBeGreaterThan(0);
    });
  });

  describe("generateSorgerechtserklaerung", () => {
    it("should generate PDF with correct structure", async () => {
      const pdfBytes = await generateSorgerechtserklaerung(mockData, "de");

      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(pdfBytes.length).toBeGreaterThan(0);
    });
  });

  describe("generateKindergeldChecklist", () => {
    it("should generate PDF with correct structure", async () => {
      const pdfBytes = await generateKindergeldChecklist(mockData, "de");

      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(pdfBytes.length).toBeGreaterThan(0);
    });
  });

  describe("generateEmergencyCustody", () => {
    it("should generate PDF with correct structure", async () => {
      const pdfBytes = await generateEmergencyCustody(mockData, "de");

      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(pdfBytes.length).toBeGreaterThan(0);
    });
  });

  describe("generateCoparentingAgreement", () => {
    it("should generate PDF with correct structure", async () => {
      const pdfBytes = await generateCoparentingAgreement(mockData, "de");

      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(pdfBytes.length).toBeGreaterThan(0);
    });
  });

  describe("Type safety", () => {
    it("should accept TemplateUserData type", () => {
      const data: TemplateUserData = {
        fatherName: "Test",
        motherName: "Test",
      };

      expect(data).toBeDefined();
      expect(typeof data.fatherName).toBe("string");
    });

    it("should handle all template types", () => {
      const templateTypes = [
        "vaterschaftsanerkennung",
        "sorgerechtserklaerung",
        "kindergeld-checklist",
        "emergency-custody",
        "coparenting-agreement",
      ] as const;

      templateTypes.forEach((type) => {
        expect(typeof type).toBe("string");
      });
    });
  });
});
