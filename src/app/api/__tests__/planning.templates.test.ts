/**
 * Tests for Planning Document Templates API
 * Tests PDF template generation and listing
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST, GET } from "@/app/api/planning/templates/route";
import { generateDocumentTemplate } from "@/lib/document-templates";

// Mock document templates library
vi.mock("@/lib/document-templates", () => ({
  generateDocumentTemplate: vi.fn(),
}));

describe("Planning Templates API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/planning/templates", () => {
    it("should return 400 if type is missing", async () => {
      const req = new NextRequest("http://localhost/api/planning/templates", {
        method: "POST",
        body: JSON.stringify({
          data: {},
        }),
      });

      const response = await POST(req);
      const data = (await response.json()) as { success: boolean; error: string };

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Type and data are required");
    });

    it("should return 400 if data is missing", async () => {
      const req = new NextRequest("http://localhost/api/planning/templates", {
        method: "POST",
        body: JSON.stringify({
          type: "vaterschaftsanerkennung",
        }),
      });

      const response = await POST(req);
      const data = (await response.json()) as { success: boolean; error: string };

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Type and data are required");
    });

    it("should generate PDF template successfully", async () => {
      const mockPdfBytes = new Uint8Array([1, 2, 3, 4, 5]);
      vi.mocked(generateDocumentTemplate).mockResolvedValue(mockPdfBytes);

      const req = new NextRequest("http://localhost/api/planning/templates", {
        method: "POST",
        body: JSON.stringify({
          type: "vaterschaftsanerkennung",
          data: {
            fatherName: "John Doe",
            motherName: "Jane Doe",
          },
          locale: "de",
        }),
      });

      const response = await POST(req);

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("application/pdf");
      expect(response.headers.get("Content-Disposition")).toContain("vaterschaftsanerkennung.pdf");
      expect(generateDocumentTemplate).toHaveBeenCalledWith(
        "vaterschaftsanerkennung",
        {
          fatherName: "John Doe",
          motherName: "Jane Doe",
        },
        "de"
      );

      const arrayBuffer = await response.arrayBuffer();
      expect(arrayBuffer).toBeDefined();
    });

    it("should use default locale if not provided", async () => {
      const mockPdfBytes = new Uint8Array([1, 2, 3]);
      vi.mocked(generateDocumentTemplate).mockResolvedValue(mockPdfBytes);

      const req = new NextRequest("http://localhost/api/planning/templates", {
        method: "POST",
        body: JSON.stringify({
          type: "sorgerechtserklaerung",
          data: {},
        }),
      });

      await POST(req);

      expect(generateDocumentTemplate).toHaveBeenCalledWith("sorgerechtserklaerung", {}, "de");
    });

    it("should handle all template types", async () => {
      const mockPdfBytes = new Uint8Array([1, 2, 3]);
      vi.mocked(generateDocumentTemplate).mockResolvedValue(mockPdfBytes);

      const templateTypes = [
        "vaterschaftsanerkennung",
        "sorgerechtserklaerung",
        "kindergeld-checklist",
        "emergency-custody",
        "coparenting-agreement",
      ];

      for (const type of templateTypes) {
        const req = new NextRequest("http://localhost/api/planning/templates", {
          method: "POST",
          body: JSON.stringify({
            type,
            data: {},
          }),
        });

        const response = await POST(req);
        expect(response.status).toBe(200);
        expect(response.headers.get("Content-Disposition")).toContain(`${type}.pdf`);
      }
    });

    it("should return 500 on generation error", async () => {
      vi.mocked(generateDocumentTemplate).mockRejectedValue(new Error("Generation failed"));

      const req = new NextRequest("http://localhost/api/planning/templates", {
        method: "POST",
        body: JSON.stringify({
          type: "vaterschaftsanerkennung",
          data: {},
        }),
      });

      const response = await POST(req);
      const data = (await response.json()) as { success: boolean; error: string };

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Generation failed");
    });
  });

  describe("GET /api/planning/templates", () => {
    it("should return list of available templates", async () => {
      const response = await GET();
      const data = (await response.json()) as {
        success: boolean;
        templates: Array<{ type: string; name: string; description: string }>;
      };

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.templates)).toBe(true);
      expect(data.templates.length).toBe(5);

      // Verify all expected templates are present
      const templateTypes = data.templates.map((t) => t.type);
      expect(templateTypes).toContain("vaterschaftsanerkennung");
      expect(templateTypes).toContain("sorgerechtserklaerung");
      expect(templateTypes).toContain("kindergeld-checklist");
      expect(templateTypes).toContain("emergency-custody");
      expect(templateTypes).toContain("coparenting-agreement");

      // Verify each template has required fields
      data.templates.forEach((template) => {
        expect(template).toHaveProperty("type");
        expect(template).toHaveProperty("name");
        expect(template).toHaveProperty("description");
        expect(template).toHaveProperty("locale");
      });
    });
  });
});
