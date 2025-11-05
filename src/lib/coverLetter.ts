import { PDFDocument, StandardFonts } from "pdf-lib";
import { resolveCourtTemplate } from "@/lib/courts";

export async function buildCoverLetter(
  kind: "joint" | "contact",
  locale: string,
  courtTemplate?: string
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([595.28, 841.89]); // A4
  const marginX = 50;
  let y = 780;
  const titleDe =
    kind === "joint" ? "Anschreiben – Gemeinsame Sorge" : "Anschreiben – Umgangsregelung";
  const titleEn =
    kind === "joint" ? "Cover Letter – Joint Custody" : "Cover Letter – Contact Order";
  const title = locale === "de" ? titleDe : titleEn;
  const date = new Date().toISOString().slice(0, 10);

  page.drawText(
    locale === "de" ? "An das Amtsgericht – Familiengericht" : "To the Local Court – Family Court",
    {
      x: marginX,
      y,
      size: 10,
      font,
    }
  );
  y -= 18;
  page.drawText(title, { x: marginX, y, size: 16, font });
  y -= 24;
  const court = resolveCourtTemplate(courtTemplate);
  if (court.name) {
    page.drawText((locale === "de" ? "Gericht: " : "Court: ") + court.name, {
      x: marginX,
      y,
      size: 11,
      font,
    });
    y -= 14;
  }
  if (court.address) {
    page.drawText((locale === "de" ? "Adresse: " : "Address: ") + court.address, {
      x: marginX,
      y,
      size: 11,
      font,
    });
    y -= 14;
  }
  const bodyDe = [
    `Datum: ${date}`,
    "",
    "Hiermit reiche ich die beigefügten Unterlagen ein.",
    kind === "joint"
      ? "Betreff: Antrag auf gemeinsame elterliche Sorge."
      : "Betreff: Antrag auf Umgangsregelung.",
  ];
  const bodyEn = [
    `Date: ${date}`,
    "",
    "Please find enclosed the attached documents.",
    kind === "joint"
      ? "Subject: Joint parental custody application."
      : "Subject: Contact/visitation order application.",
  ];
  const body = (locale === "de" ? bodyDe : bodyEn).join("\n");
  for (const line of body.split("\n")) {
    page.drawText(line, { x: marginX, y, size: 11, font });
    y -= 14;
  }
  y -= 6;
  page.drawText(locale === "de" ? "Anlagen:" : "Attachments:", { x: marginX, y, size: 11, font });
  y -= 14;
  const attachments =
    kind === "joint"
      ? [
          locale === "de" ? "Formular Antrag gemeinsame Sorge" : "Joint custody application form",
          locale === "de" ? "Geburtsurkunde(n)" : "Birth certificate(s)",
          locale === "de"
            ? "Vaterschaftsanerkennung (falls vorhanden)"
            : "Paternity acknowledgement (if any)",
          locale === "de" ? "Erstbesuch‑Checkliste (kurz)" : "First‑visit checklist (short)",
        ]
      : [
          locale === "de" ? "Formular Umgangsregelung" : "Contact order form",
          locale === "de"
            ? "Kommunikationsprotokolle/Logs (Auszüge)"
            : "Communications/logs (excerpts)",
          locale === "de"
            ? "Nachweise Zahlungen (falls relevant)"
            : "Proof of payments (if relevant)",
          locale === "de" ? "Erstbesuch‑Checkliste (kurz)" : "First‑visit checklist (short)",
        ];
  for (const a of attachments) {
    page.drawText("- " + a, { x: marginX + 10, y, size: 11, font });
    y -= 14;
  }
  y -= 20;
  page.drawText(locale === "de" ? "Unterschrift:" : "Signature:", {
    x: marginX,
    y,
    size: 11,
    font,
  });
  y -= 20;
  page.drawText("____________________________", { x: marginX, y, size: 11, font });

  const bytes = await doc.save();
  return bytes;
}
