/**
 * Document Templates Library
 * Generates fillable document templates for common custody-related forms
 * Phase 3.3: Document Templates
 */

import { PDFDocument, StandardFonts, PageSizes, rgb } from "pdf-lib";

/**
 * Template types available
 */
export type DocumentTemplateType =
  | "vaterschaftsanerkennung"
  | "sorgerechtserklaerung"
  | "kindergeld-checklist"
  | "emergency-custody"
  | "coparenting-agreement";

/**
 * User data for filling templates
 */
export interface TemplateUserData {
  fatherName?: string;
  motherName?: string;
  childName?: string;
  childBirthDate?: string;
  fatherAddress?: string;
  motherAddress?: string;
  fatherBirthDate?: string;
  motherBirthDate?: string;
  fatherBirthPlace?: string;
  motherBirthPlace?: string;
  fatherNationality?: string;
  motherNationality?: string;
  city?: string;
  date?: string;
  [key: string]: string | undefined;
}

/**
 * Generate Vaterschaftsanerkennung (Paternity Acknowledgment) form
 */
export async function generateVaterschaftsanerkennung(
  data: TemplateUserData,
  _locale = "de"
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage(PageSizes.A4);
  const { width, height } = page.getSize();
  const margin = 50;
  let y = height - margin;

  // Title
  page.drawText("Vaterschaftsanerkennung", {
    x: margin,
    y,
    size: 16,
    font: helveticaBold,
  });
  y -= 30;

  // Instructions
  page.drawText(
    "Dieses Formular dient als Vorlage für die Vaterschaftsanerkennung. Bitte füllen Sie es aus und bringen Sie es zum Jugendamt oder Standesamt.",
    {
      x: margin,
      y,
      size: 10,
      font: helvetica,
      maxWidth: width - 2 * margin,
    }
  );
  y -= 40;

  // Form fields
  const drawField = (label: string, value: string | undefined): void => {
    page.drawText(`${label}:`, {
      x: margin,
      y,
      size: 11,
      font: helveticaBold,
    });
    y -= 15;
    page.drawText(value || "___________________________", {
      x: margin + 20,
      y,
      size: 11,
      font: helvetica,
    });
    y -= 25;
  };

  drawField("Name des Vaters", data.fatherName);
  drawField("Geburtsdatum des Vaters", data.fatherBirthDate);
  drawField("Geburtsort des Vaters", data.fatherBirthPlace);
  drawField("Adresse des Vaters", data.fatherAddress);
  drawField("Nationalität des Vaters", data.fatherNationality);

  y -= 20;
  drawField("Name der Mutter", data.motherName);
  drawField("Geburtsdatum der Mutter", data.motherBirthDate);
  drawField("Geburtsort der Mutter", data.motherBirthPlace);
  drawField("Adresse der Mutter", data.motherAddress);
  drawField("Nationalität der Mutter", data.motherNationality);

  y -= 20;
  drawField("Name des Kindes", data.childName);
  drawField("Geburtsdatum des Kindes", data.childBirthDate);

  y -= 30;
  page.drawText("Ort, Datum:", {
    x: margin,
    y,
    size: 11,
    font: helveticaBold,
  });
  y -= 15;
  page.drawText(data.city || "_________________", {
    x: margin + 20,
    y,
    size: 11,
    font: helvetica,
  });
  page.drawText(data.date || "_________________", {
    x: margin + 200,
    y,
    size: 11,
    font: helvetica,
  });

  y -= 40;
  page.drawText("Unterschrift des Vaters:", {
    x: margin,
    y,
    size: 11,
    font: helveticaBold,
  });
  y -= 30;
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  y -= 40;
  page.drawText("Unterschrift der Mutter:", {
    x: margin,
    y,
    size: 11,
    font: helveticaBold,
  });
  y -= 30;
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  return await pdfDoc.save();
}

/**
 * Generate Sorgerechtserklärung (Joint Custody Declaration) template
 */
export async function generateSorgerechtserklaerung(
  data: TemplateUserData,
  _locale = "de"
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage(PageSizes.A4);
  const { width, height } = page.getSize();
  const margin = 50;
  let y = height - margin;

  // Title
  page.drawText("Sorgeerklärung (Gemeinsame Sorgeerklärung)", {
    x: margin,
    y,
    size: 16,
    font: helveticaBold,
  });
  y -= 30;

  // Instructions
  page.drawText(
    "Dieses Formular dient als Vorlage für die gemeinsame Sorgeerklärung. Beide Elternteile müssen gemeinsam beim Jugendamt erscheinen.",
    {
      x: margin,
      y,
      size: 10,
      font: helvetica,
      maxWidth: width - 2 * margin,
    }
  );
  y -= 40;

  const drawField = (label: string, value: string | undefined): void => {
    page.drawText(`${label}:`, {
      x: margin,
      y,
      size: 11,
      font: helveticaBold,
    });
    y -= 15;
    page.drawText(value || "___________________________", {
      x: margin + 20,
      y,
      size: 11,
      font: helvetica,
    });
    y -= 25;
  };

  drawField("Name des Vaters", data.fatherName);
  drawField("Name der Mutter", data.motherName);
  drawField("Name des Kindes", data.childName);
  drawField("Geburtsdatum des Kindes", data.childBirthDate);

  y -= 30;
  page.drawText(
    "Wir erklären hiermit, dass wir die gemeinsame elterliche Sorge für unser Kind übernehmen möchten.",
    {
      x: margin,
      y,
      size: 11,
      font: helvetica,
      maxWidth: width - 2 * margin,
    }
  );
  y -= 50;

  page.drawText("Ort, Datum:", {
    x: margin,
    y,
    size: 11,
    font: helveticaBold,
  });
  y -= 15;
  page.drawText(data.city || "_________________", {
    x: margin + 20,
    y,
    size: 11,
    font: helvetica,
  });
  page.drawText(data.date || "_________________", {
    x: margin + 200,
    y,
    size: 11,
    font: helvetica,
  });

  y -= 40;
  page.drawText("Unterschrift des Vaters:", {
    x: margin,
    y,
    size: 11,
    font: helveticaBold,
  });
  y -= 30;
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  y -= 40;
  page.drawText("Unterschrift der Mutter:", {
    x: margin,
    y,
    size: 11,
    font: helveticaBold,
  });
  y -= 30;
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  return await pdfDoc.save();
}

/**
 * Generate Kindergeld application checklist
 */
export async function generateKindergeldChecklist(
  data: TemplateUserData,
  _locale = "de"
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage(PageSizes.A4);
  const { height } = page.getSize();
  const margin = 50;
  let y = height - margin;

  // Title
  page.drawText("Kindergeld Antrag - Checkliste", {
    x: margin,
    y,
    size: 16,
    font: helveticaBold,
  });
  y -= 30;

  const checklistItems = [
    "Geburtsurkunde des Kindes",
    "Steuer-ID des Kindes (wird automatisch zugesendet)",
    "Steuer-ID des Antragstellers",
    "Bankverbindung (IBAN)",
    "Meldebescheinigung (Anmeldung)",
    "Ausgefülltes Antragsformular",
  ];

  checklistItems.forEach((item) => {
    page.drawText("[ ]", {
      x: margin,
      y,
      size: 12,
      font: helvetica,
    });
    page.drawText(item, {
      x: margin + 25,
      y,
      size: 11,
      font: helvetica,
    });
    y -= 25;
  });

  y -= 20;
  page.drawText("Antragsteller:", {
    x: margin,
    y,
    size: 11,
    font: helveticaBold,
  });
  y -= 20;
  page.drawText(data.fatherName || data.motherName || "_________________", {
    x: margin + 20,
    y,
    size: 11,
    font: helvetica,
  });

  return await pdfDoc.save();
}

/**
 * Generate emergency custody declaration template
 */
export async function generateEmergencyCustody(
  data: TemplateUserData,
  _locale = "de"
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage(PageSizes.A4);
  const { width, height } = page.getSize();
  const margin = 50;
  let y = height - margin;

  page.drawText("Notfall-Sorgerechtserklärung", {
    x: margin,
    y,
    size: 16,
    font: helveticaBold,
  });
  y -= 30;

  page.drawText(
    "WICHTIG: Dieses Dokument dient nur als Vorlage. Bei Notfällen wenden Sie sich sofort an das Jugendamt oder Familiengericht.",
    {
      x: margin,
      y,
      size: 10,
      font: helvetica,
      maxWidth: width - 2 * margin,
      color: rgb(1, 0, 0),
    }
  );
  y -= 40;

  const drawField = (label: string, value: string | undefined): void => {
    page.drawText(`${label}:`, {
      x: margin,
      y,
      size: 11,
      font: helveticaBold,
    });
    y -= 15;
    page.drawText(value || "___________________________", {
      x: margin + 20,
      y,
      size: 11,
      font: helvetica,
    });
    y -= 25;
  };

  drawField("Name des Kindes", data.childName);
  drawField("Geburtsdatum", data.childBirthDate);
  drawField("Name des Sorgeberechtigten", data.fatherName || data.motherName);

  return await pdfDoc.save();
}

/**
 * Generate co-parenting agreement outline
 */
export async function generateCoparentingAgreement(
  data: TemplateUserData,
  _locale = "de"
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage(PageSizes.A4);
  const { height } = page.getSize();
  const margin = 50;
  let y = height - margin;

  page.drawText("Co-Elternschaftsvereinbarung - Vorlage", {
    x: margin,
    y,
    size: 16,
    font: helveticaBold,
  });
  y -= 30;

  const sections = [
    "1. Wohnsitz und Aufenthaltsbestimmungsrecht",
    "2. Umgangsregelung (Besuchszeiten)",
    "3. Entscheidungsbefugnisse (Schule, Gesundheit, etc.)",
    "4. Finanzielle Verpflichtungen (Unterhalt)",
    "5. Kommunikation zwischen Eltern",
    "6. Ferien und Feiertage",
    "7. Änderungen der Vereinbarung",
  ];

  sections.forEach((section) => {
    page.drawText(section, {
      x: margin,
      y,
      size: 11,
      font: helveticaBold,
    });
    y -= 20;
    page.drawText("_________________________________________________", {
      x: margin + 20,
      y,
      size: 10,
      font: helvetica,
    });
    y -= 30;
  });

  return await pdfDoc.save();
}

/**
 * Generate document template by type
 */
export async function generateDocumentTemplate(
  type: DocumentTemplateType,
  data: TemplateUserData,
  locale = "de"
): Promise<Uint8Array> {
  switch (type) {
    case "vaterschaftsanerkennung":
      return generateVaterschaftsanerkennung(data, locale);
    case "sorgerechtserklaerung":
      return generateSorgerechtserklaerung(data, locale);
    case "kindergeld-checklist":
      return generateKindergeldChecklist(data, locale);
    case "emergency-custody":
      return generateEmergencyCustody(data, locale);
    case "coparenting-agreement":
      return generateCoparentingAgreement(data, locale);
    default:
      throw new Error(`Unknown template type: ${type}`);
  }
}
