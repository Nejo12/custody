/**
 * Tests for ChecklistPDF Component
 * Tests PDF generation functionality
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateChecklistPDF, downloadChecklistPDF } from "../ChecklistPDF";
import type { PersonalizedChecklist } from "@/types/planning";

// Mock pdf-lib
vi.mock("pdf-lib", async () => {
  const actual = await vi.importActual("pdf-lib");
  return {
    ...actual,
    PDFDocument: {
      create: vi.fn().mockResolvedValue({
        embedFont: vi.fn().mockResolvedValue({
          widthOfTextAtSize: vi.fn(() => 50),
        }),
        addPage: vi.fn(() => ({
          getSize: vi.fn(() => ({ width: 595.28, height: 841.89 })),
          drawText: vi.fn(),
          drawLine: vi.fn(),
        })),
        setTitle: vi.fn(),
        setSubject: vi.fn(),
        setKeywords: vi.fn(),
        save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
      }),
    },
    StandardFonts: {
      Helvetica: "Helvetica",
      HelveticaBold: "HelveticaBold",
    },
    PageSizes: {
      A4: [595.28, 841.89],
    },
    rgb: vi.fn((r: number, g: number, b: number) => ({ r, g, b })),
  };
});

describe("ChecklistPDF", () => {
  const mockChecklist: PersonalizedChecklist = {
    situation: {
      relationshipStatus: "unmarried",
      pregnancyStage: "first-trimester",
      hasPaternityCertificate: false,
      hasJointCustody: false,
      relationshipStable: true,
      city: "Berlin",
    },
    priorityItems: [
      {
        id: "test-item-1",
        title: "Test Priority Task",
        description: "Test description",
        stage: "expecting",
        urgency: "critical",
        estimatedTime: "30 minutes",
        location: "Jugendamt",
        cost: "Free",
      },
    ],
    recommendedGuides: [
      {
        slug: "test-guide",
        title: "Test Guide",
        excerpt: "Test guide excerpt",
        stage: "expecting",
        urgency: "high",
        published: "2025-01-01",
        readTime: "5 min read",
        content: "Test content",
      },
    ],
    cityResources: {
      city: "Berlin",
      postcode: "10115",
      standesamt: {
        name: "Standesamt Berlin-Mitte",
        address: "Test Address",
        phone: "030-123456",
        appointmentRequired: true,
      },
      jugendamt: {
        name: "Jugendamt Berlin-Mitte",
        address: "Test Address",
        phone: "030-654321",
        appointmentRequired: true,
      },
    },
    nextSteps: ["Step 1", "Step 2"],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = vi.fn();
    // Mock document.createElement and appendChild
    const mockLink = {
      href: "",
      download: "",
      click: vi.fn(),
    };
    global.document.createElement = vi.fn(() => mockLink as unknown as HTMLElement);
    global.document.body.appendChild = vi.fn();
    global.document.body.removeChild = vi.fn();
  });

  it("generates PDF successfully", async () => {
    const pdfBytes = await generateChecklistPDF(mockChecklist, "en");

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(0);
  });

  it("handles checklist without city resources", async () => {
    const checklistWithoutCity: PersonalizedChecklist = {
      ...mockChecklist,
      cityResources: undefined,
    };

    const pdfBytes = await generateChecklistPDF(checklistWithoutCity, "en");

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
  });

  it("handles checklist without priority items", async () => {
    const checklistWithoutItems: PersonalizedChecklist = {
      ...mockChecklist,
      priorityItems: [],
    };

    const pdfBytes = await generateChecklistPDF(checklistWithoutItems, "en");

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
  });

  it("handles checklist without recommended guides", async () => {
    const checklistWithoutGuides: PersonalizedChecklist = {
      ...mockChecklist,
      recommendedGuides: [],
    };

    const pdfBytes = await generateChecklistPDF(checklistWithoutGuides, "en");

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
  });

  it("handles checklist without next steps", async () => {
    const checklistWithoutSteps: PersonalizedChecklist = {
      ...mockChecklist,
      nextSteps: [],
    };

    const pdfBytes = await generateChecklistPDF(checklistWithoutSteps, "en");

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
  });

  it("handles married relationship status", async () => {
    const marriedChecklist: PersonalizedChecklist = {
      ...mockChecklist,
      situation: {
        ...mockChecklist.situation,
        relationshipStatus: "married",
      },
    };

    const pdfBytes = await generateChecklistPDF(marriedChecklist, "en");

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
  });

  it("handles child age instead of pregnancy stage", async () => {
    const childAgeChecklist: PersonalizedChecklist = {
      ...mockChecklist,
      situation: {
        ...mockChecklist.situation,
        pregnancyStage: undefined,
        childAge: "0-3-months",
      },
    };

    const pdfBytes = await generateChecklistPDF(childAgeChecklist, "en");

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
  });

  it("downloads PDF successfully", async () => {
    await downloadChecklistPDF(mockChecklist, "en");

    expect(global.document.createElement).toHaveBeenCalledWith("a");
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  it("handles download errors gracefully", async () => {
    const { PDFDocument } = await import("pdf-lib");
    vi.mocked(PDFDocument.create).mockRejectedValueOnce(new Error("PDF generation failed"));

    await expect(downloadChecklistPDF(mockChecklist, "en")).rejects.toThrow();
  });
});
