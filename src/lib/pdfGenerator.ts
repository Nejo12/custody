import { PDFDocument, StandardFonts, rgb, PageSizes } from "pdf-lib";

export interface InterviewData {
  custodyType?: string;
  parentName?: string;
  childrenNames?: string[];
  coParentName?: string;
  residenceArrangement?: string;
  contactSchedule?: string;
  decisionMaking?: string;
  financialSupport?: string;
  specialNeeds?: string;
  additionalNotes?: string;
  [key: string]: unknown;
}

export interface PDFGenerationOptions {
  tier: "BASIC" | "PROFESSIONAL" | "ATTORNEY";
  documentType: string;
  interviewData: InterviewData;
  locale?: string;
}

/**
 * Generate a professional custody document PDF
 */
export async function generateCustodyPDF(options: PDFGenerationOptions): Promise<Buffer> {
  const { tier, documentType, interviewData, locale = "en" } = options;

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Add first page
  let page = pdfDoc.addPage(PageSizes.A4);
  const { width, height } = page.getSize();
  const margin = 50;
  let y = height - margin;

  // Helper function to add text
  const addText = (
    text: string,
    options: {
      size?: number;
      font?: typeof helvetica;
      color?: ReturnType<typeof rgb>;
      bold?: boolean;
      indent?: number;
    } = {}
  ) => {
    const {
      size = 12,
      font = options.bold ? helveticaBold : helvetica,
      color = rgb(0, 0, 0),
      indent = 0,
    } = options;

    // Check if we need a new page
    if (y < margin + 20) {
      page = pdfDoc.addPage(PageSizes.A4);
      y = height - margin;
    }

    page.drawText(text, {
      x: margin + indent,
      y,
      size,
      font,
      color,
    });
    y -= size + 8;
  };

  // Helper to add line break
  const addLineBreak = () => {
    y -= 10;
  };

  // HEADER
  addText("CUSTODY CLARITY", { size: 24, bold: true, color: rgb(0.4, 0.5, 0.9) });
  addText("Custody Rights Documentation", { size: 14, color: rgb(0.4, 0.4, 0.4) });
  addLineBreak();
  addLineBreak();

  // Document Type and Date
  addText(`Document Type: ${documentType.replace(/-/g, " ").toUpperCase()}`, {
    size: 12,
    bold: true,
  });
  addText(`Generated: ${new Date().toLocaleDateString(locale === "de" ? "de-DE" : "en-US")}`, {
    size: 10,
  });
  addText(`Tier: ${tier}`, { size: 10 });
  addLineBreak();
  addLineBreak();

  // Add horizontal line
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: rgb(0.7, 0.7, 0.7),
  });
  y -= 20;

  // DISCLAIMER (All tiers)
  addText("IMPORTANT LEGAL NOTICE", { size: 12, bold: true, color: rgb(0.8, 0.3, 0.3) });
  addLineBreak();
  addText("This document provides general information about custody rights under German law.", {
    size: 9,
  });
  addText("It is NOT legal advice and should NOT be used as a substitute for consulting with", {
    size: 9,
  });
  addText(
    "a qualified family law attorney. Always seek professional legal counsel for your specific situation.",
    { size: 9 }
  );
  addLineBreak();
  addLineBreak();

  // INTERVIEW SUMMARY
  addText("YOUR INFORMATION", { size: 14, bold: true, color: rgb(0.4, 0.5, 0.9) });
  addLineBreak();

  if (interviewData.custodyType) {
    addText(`Custody Arrangement: ${interviewData.custodyType}`, { size: 11 });
  }
  if (interviewData.parentName) {
    addText(`Parent Name: ${interviewData.parentName}`, { size: 11 });
  }
  if (interviewData.childrenNames && interviewData.childrenNames.length > 0) {
    addText(`Children: ${interviewData.childrenNames.join(", ")}`, { size: 11 });
  }
  if (interviewData.coParentName) {
    addText(`Co-Parent: ${interviewData.coParentName}`, { size: 11 });
  }
  addLineBreak();
  addLineBreak();

  // CUSTODY TYPE EXPLANATION
  addText("CUSTODY RIGHTS OVERVIEW", { size: 14, bold: true, color: rgb(0.4, 0.5, 0.9) });
  addLineBreak();

  addText("Joint Custody (Gemeinsames Sorgerecht) - § 1626 BGB", { size: 12, bold: true });
  addText("Both parents share responsibility for major decisions about the child's welfare,", {
    size: 10,
    indent: 20,
  });
  addText("education, health, and residence.", { size: 10, indent: 20 });
  addLineBreak();

  addText("Sole Custody (Alleiniges Sorgerecht) - § 1671 BGB", { size: 12, bold: true });
  addText("One parent has exclusive decision-making authority. Granted only when joint custody", {
    size: 10,
    indent: 20,
  });
  addText("is not in the child's best interest.", { size: 10, indent: 20 });
  addLineBreak();

  addText("Contact Rights (Umgangsrecht) - § 1684 BGB", { size: 12, bold: true });
  addText("The child has the right to maintain contact with both parents. Parents are obligated", {
    size: 10,
    indent: 20,
  });
  addText("to facilitate contact and must refrain from actions that harm the relationship.", {
    size: 10,
    indent: 20,
  });
  addLineBreak();
  addLineBreak();

  // TIER-SPECIFIC CONTENT
  if (tier === "PROFESSIONAL" || tier === "ATTORNEY") {
    // Add Residence Arrangement section
    if (interviewData.residenceArrangement) {
      addText("RESIDENCE ARRANGEMENT", { size: 14, bold: true, color: rgb(0.4, 0.5, 0.9) });
      addLineBreak();
      addText(interviewData.residenceArrangement, { size: 10 });
      addLineBreak();
      addLineBreak();
    }

    // Add Contact Schedule
    if (interviewData.contactSchedule) {
      addText("PROPOSED CONTACT SCHEDULE", { size: 14, bold: true, color: rgb(0.4, 0.5, 0.9) });
      addLineBreak();
      addText(interviewData.contactSchedule, { size: 10 });
      addLineBreak();
      addLineBreak();
    }

    // Add Decision Making
    if (interviewData.decisionMaking) {
      addText("DECISION-MAKING FRAMEWORK", { size: 14, bold: true, color: rgb(0.4, 0.5, 0.9) });
      addLineBreak();
      addText(interviewData.decisionMaking, { size: 10 });
      addLineBreak();
      addLineBreak();
    }
  }

  // ATTORNEY TIER ONLY
  if (tier === "ATTORNEY") {
    addText("SUBMISSION GUIDELINES", { size: 14, bold: true, color: rgb(0.4, 0.5, 0.9) });
    addLineBreak();
    addText("Where to Submit Your Application:", { size: 11, bold: true });
    addLineBreak();
    addText("1. Familiengericht (Family Court)", { size: 10, indent: 20 });
    addText(
      "   Submit your custody application to the family court in the district where the child resides.",
      { size: 9, indent: 20 }
    );
    addLineBreak();
    addText("2. Required Documents:", { size: 10, indent: 20 });
    addText("   - Birth certificate of the child (certified copy)", { size: 9, indent: 40 });
    addText("   - Proof of parentage (if applicable)", { size: 9, indent: 40 });
    addText("   - Custody application form (Antrag auf Sorgerecht)", { size: 9, indent: 40 });
    addText("   - Statement of reasons (Begründung)", { size: 9, indent: 40 });
    addLineBreak();
    addText("3. Filing Fees:", { size: 10, indent: 20 });
    addText(
      "   Court fees vary by case. Low-income applicants may apply for cost exemption (Prozesskostenhilfe).",
      { size: 9, indent: 40 }
    );
    addLineBreak();
    addLineBreak();

    // Evidence Checklist
    addText("EVIDENCE CHECKLIST", { size: 14, bold: true, color: rgb(0.4, 0.5, 0.9) });
    addLineBreak();
    addText("Strengthen your case by providing:", { size: 10 });
    addText("☐ Documentation of daily care routines", { size: 10, indent: 20 });
    addText("☐ School/daycare records showing your involvement", { size: 10, indent: 20 });
    addText("☐ Medical records demonstrating care responsibilities", { size: 10, indent: 20 });
    addText("☐ Communication logs with co-parent (emails, texts)", { size: 10, indent: 20 });
    addText("☐ Witness statements (teachers, relatives, doctors)", { size: 10, indent: 20 });
    addText("☐ Photos/videos showing parent-child relationship", { size: 10, indent: 20 });
    addLineBreak();
    addLineBreak();

    // Legal Representation
    addText("LEGAL REPRESENTATION", { size: 14, bold: true, color: rgb(0.4, 0.5, 0.9) });
    addLineBreak();
    addText(
      "While not mandatory, consulting with a family law attorney (Fachanwalt für Familienrecht)",
      { size: 10 }
    );
    addText(
      "is strongly recommended. An attorney can help you navigate court procedures, negotiate",
      { size: 10 }
    );
    addText("agreements, and protect your parental rights.", { size: 10 });
    addLineBreak();
  }

  // FOOTER (All Pages)
  const pages = pdfDoc.getPages();
  pages.forEach((p, index) => {
    p.drawText(`Custody Clarity | Page ${index + 1} of ${pages.length}`, {
      x: margin,
      y: 30,
      size: 8,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5),
    });
    p.drawText("custodyclarity.com", {
      x: width - margin - 100,
      y: 30,
      size: 8,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5),
    });
  });

  // Save the PDF
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
