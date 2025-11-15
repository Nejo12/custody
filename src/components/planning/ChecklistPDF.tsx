"use client";

/**
 * ChecklistPDF Component
 * Client-side PDF generation for personalized planning checklist
 */

import { PDFDocument, StandardFonts, PageSizes, rgb } from "pdf-lib";
import type { PersonalizedChecklist } from "@/types/planning";
import { trackEvent } from "@/components/Analytics";

/**
 * Generate PDF from personalized checklist
 * @param checklist - The personalized checklist data
 * @param locale - Optional locale for translations
 * @returns PDF as Uint8Array
 */
export async function generateChecklistPDF(
  checklist: PersonalizedChecklist,
  locale = "en"
): Promise<Uint8Array> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Set document metadata
  pdfDoc.setTitle("Personalized Planning Checklist");
  pdfDoc.setSubject("Custody Rights Planning & Prevention Checklist");
  pdfDoc.setKeywords([
    "custody",
    "planning",
    "checklist",
    "parental rights",
    "Germany",
    "Vaterschaftsanerkennung",
    "Sorgeerklärung",
  ]);

  // Add first page
  let page = pdfDoc.addPage(PageSizes.A4);
  const { width, height } = page.getSize();
  const margin = 50;
  let y = height - margin;

  /**
   * Helper function to add text to PDF
   */
  const addText = (
    text: string,
    options: {
      size?: number;
      bold?: boolean;
      color?: ReturnType<typeof rgb>;
      indent?: number;
    } = {}
  ): void => {
    const { size = 12, bold = false, color = rgb(0, 0, 0), indent = 0 } = options;

    // Check if we need a new page
    if (y < margin + 20) {
      page = pdfDoc.addPage(PageSizes.A4);
      y = height - margin;
    }

    const font = bold ? helveticaBold : helvetica;
    page.drawText(text, {
      x: margin + indent,
      y,
      size,
      font,
      color,
    });
    y -= size + 8;
  };

  /**
   * Helper to add line break
   */
  const addLineBreak = (spacing = 10): void => {
    y -= spacing;
  };

  /**
   * Helper to add horizontal line
   */
  const addHorizontalLine = (): void => {
    if (y < margin + 20) {
      page = pdfDoc.addPage(PageSizes.A4);
      y = height - margin;
    }
    page.drawLine({
      start: { x: margin, y },
      end: { x: width - margin, y },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    });
    y -= 15;
  };

  // HEADER
  addText("CUSTODY CLARITY", {
    size: 24,
    bold: true,
    color: rgb(0.2, 0.4, 0.8),
  });
  addText("Personalized Planning Checklist", {
    size: 14,
    color: rgb(0.4, 0.4, 0.4),
  });
  addText(`Generated: ${new Date().toLocaleDateString(locale)}`, {
    size: 10,
    color: rgb(0.5, 0.5, 0.5),
  });
  addLineBreak(15);
  addHorizontalLine();

  // SITUATION SUMMARY
  addText("Your Situation", { size: 16, bold: true });
  addLineBreak(5);

  // Relationship status
  const relationshipStatusText =
    checklist.situation.relationshipStatus === "married"
      ? "Married"
      : checklist.situation.relationshipStatus === "unmarried"
        ? "Unmarried / Living Together"
        : checklist.situation.relationshipStatus === "separated"
          ? "Separated"
          : "Other";

  addText(`Relationship Status: ${relationshipStatusText}`, { size: 11 });

  // Pregnancy stage or child age
  if (checklist.situation.pregnancyStage) {
    const stageText =
      checklist.situation.pregnancyStage === "planning"
        ? "Planning pregnancy"
        : checklist.situation.pregnancyStage === "first-trimester"
          ? "First trimester"
          : checklist.situation.pregnancyStage === "second-trimester"
            ? "Second trimester"
            : checklist.situation.pregnancyStage === "third-trimester"
              ? "Third trimester"
              : "Postpartum";
    addText(`Stage: ${stageText}`, { size: 11 });
  }

  if (checklist.situation.childAge) {
    const ageText =
      checklist.situation.childAge === "not-born"
        ? "Not yet born"
        : checklist.situation.childAge === "0-3-months"
          ? "0-3 months"
          : checklist.situation.childAge === "3-6-months"
            ? "3-6 months"
            : checklist.situation.childAge === "6-12-months"
              ? "6-12 months"
              : checklist.situation.childAge === "1-2-years"
                ? "1-2 years"
                : "Older than 2 years";
    addText(`Child Age: ${ageText}`, { size: 11 });
  }

  // Legal status
  if (checklist.situation.relationshipStatus !== "married") {
    addText(
      `Paternity Acknowledged: ${checklist.situation.hasPaternityCertificate ? "Yes" : "No"}`,
      { size: 11 }
    );
    addText(`Joint Custody: ${checklist.situation.hasJointCustody ? "Yes" : "No"}`, { size: 11 });
  }

  addText(`Relationship Stable: ${checklist.situation.relationshipStable ? "Yes" : "No"}`, {
    size: 11,
  });

  if (checklist.situation.city) {
    addText(`City: ${checklist.situation.city}`, { size: 11 });
  }

  addLineBreak(15);
  addHorizontalLine();

  // PRIORITY TASKS
  addText("Priority Tasks", { size: 16, bold: true });
  addLineBreak(5);

  if (checklist.priorityItems.length === 0) {
    addText("No priority tasks found for your situation.", {
      size: 11,
      color: rgb(0.5, 0.5, 0.5),
    });
  } else {
    checklist.priorityItems.forEach((item, index) => {
      addLineBreak(5);
      addText(`${index + 1}. ${item.title}`, {
        size: 12,
        bold: true,
      });
      addText(item.description, {
        size: 10,
        indent: 15,
        color: rgb(0.3, 0.3, 0.3),
      });

      // Add metadata
      const metadata: string[] = [];
      if (item.estimatedTime) {
        metadata.push(`Time: ${item.estimatedTime}`);
      }
      if (item.location) {
        metadata.push(`Location: ${item.location}`);
      }
      if (item.cost) {
        metadata.push(`Cost: ${item.cost}`);
      }

      if (metadata.length > 0) {
        addText(metadata.join(" • "), {
          size: 9,
          indent: 15,
          color: rgb(0.4, 0.4, 0.4),
        });
      }

      // Urgency badge
      const urgencyText =
        item.urgency === "critical"
          ? "CRITICAL"
          : item.urgency === "high"
            ? "HIGH PRIORITY"
            : item.urgency === "medium"
              ? "MEDIUM PRIORITY"
              : "IMPORTANT";

      addText(`Priority: ${urgencyText}`, {
        size: 9,
        indent: 15,
        color: rgb(0.5, 0.5, 0.5),
      });
    });
  }

  addLineBreak(15);
  addHorizontalLine();

  // RECOMMENDED GUIDES
  if (checklist.recommendedGuides.length > 0) {
    addText("Recommended Guides", { size: 16, bold: true });
    addLineBreak(5);

    checklist.recommendedGuides.forEach((guide, index) => {
      addLineBreak(5);
      addText(`${index + 1}. ${guide.title}`, {
        size: 11,
        bold: true,
      });
      addText(guide.excerpt, {
        size: 9,
        indent: 15,
        color: rgb(0.4, 0.4, 0.4),
      });
    });

    addLineBreak(15);
    addHorizontalLine();
  }

  // LOCAL RESOURCES
  if (checklist.cityResources) {
    addText("Local Resources", { size: 16, bold: true });
    addLineBreak(5);

    addText(`${checklist.cityResources.city} (${checklist.cityResources.postcode})`, {
      size: 12,
      bold: true,
    });
    addLineBreak(5);

    // Standesamt
    addText("Standesamt (Registry Office)", {
      size: 11,
      bold: true,
    });
    addText(checklist.cityResources.standesamt.name, {
      size: 10,
      indent: 15,
    });
    addText(checklist.cityResources.standesamt.address, {
      size: 10,
      indent: 15,
    });
    if (checklist.cityResources.standesamt.phone) {
      addText(`Phone: ${checklist.cityResources.standesamt.phone}`, {
        size: 10,
        indent: 15,
      });
    }
    if (checklist.cityResources.standesamt.email) {
      addText(`Email: ${checklist.cityResources.standesamt.email}`, {
        size: 10,
        indent: 15,
      });
    }

    addLineBreak(5);

    // Jugendamt
    addText("Jugendamt (Youth Welfare Office)", {
      size: 11,
      bold: true,
    });
    addText(checklist.cityResources.jugendamt.name, {
      size: 10,
      indent: 15,
    });
    addText(checklist.cityResources.jugendamt.address, {
      size: 10,
      indent: 15,
    });
    if (checklist.cityResources.jugendamt.phone) {
      addText(`Phone: ${checklist.cityResources.jugendamt.phone}`, {
        size: 10,
        indent: 15,
      });
    }
    if (checklist.cityResources.jugendamt.email) {
      addText(`Email: ${checklist.cityResources.jugendamt.email}`, {
        size: 10,
        indent: 15,
      });
    }

    addLineBreak(15);
    addHorizontalLine();
  }

  // NEXT STEPS
  if (checklist.nextSteps.length > 0) {
    addText("Next Steps", { size: 16, bold: true });
    addLineBreak(5);

    checklist.nextSteps.forEach((step, index) => {
      addText(`${index + 1}. ${step}`, {
        size: 11,
        indent: 0,
      });
    });

    addLineBreak(15);
    addHorizontalLine();
  }

  // FOOTER
  addLineBreak(10);
  addText("Disclaimer", { size: 12, bold: true });
  addText(
    "This checklist is generated based on your responses and provides general guidance only. It is not individualized legal advice. Consult a qualified family law attorney (Fachanwalt für Familienrecht) for advice specific to your situation.",
    {
      size: 8,
      color: rgb(0.5, 0.5, 0.5),
    }
  );
  addLineBreak(5);
  addText(`Generated by Custody Clarity on ${new Date().toLocaleString(locale)}`, {
    size: 8,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Save PDF
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

/**
 * Download PDF helper function
 */
export async function downloadChecklistPDF(
  checklist: PersonalizedChecklist,
  locale = "en"
): Promise<void> {
  try {
    const pdfBytes = await generateChecklistPDF(checklist, locale);
    // Create a new ArrayBuffer from the Uint8Array
    const buffer = new ArrayBuffer(pdfBytes.length);
    const view = new Uint8Array(buffer);
    view.set(pdfBytes);
    const blob = new Blob([buffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `planning-checklist-${new Date().toISOString().split("T")[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Track PDF download analytics
    trackEvent("planning_pdf_downloaded", {
      type: "personalized-checklist",
      itemCount: checklist.priorityItems.length,
      priorityCount: checklist.priorityItems.filter((item) => item.urgency === "critical").length,
      locale,
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}
