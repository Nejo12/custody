import { PDFDocument, StandardFonts } from "pdf-lib";
import { resolveCourtTemplate } from "@/lib/courts";

export type Sender = {
  fullName?: string;
  address?: string;
  phone?: string;
  email?: string;
  city?: string;
};

export async function buildCoverLetter(
  kind: "joint" | "contact" | "mediation" | "blocked",
  locale: string,
  courtTemplate?: string,
  sender?: Sender
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([595.28, 841.89]); // A4
  const marginX = 50;
  let y = 780;
  // Sender block (top-right)
  if (sender && (sender.fullName || sender.address || sender.phone || sender.email)) {
    let yRight = 800;
    const xRight = 360;
    if (sender.fullName) {
      page.drawText(sender.fullName, { x: xRight, y: yRight, size: 11, font });
      yRight -= 14;
    }
    if (sender.address) {
      const lines = String(sender.address).split(/\n+/);
      for (const ln of lines) {
        page.drawText(ln, { x: xRight, y: yRight, size: 11, font });
        yRight -= 14;
      }
    }
    if (sender.phone) {
      page.drawText((locale === "de" ? "Telefon: " : "Phone: ") + sender.phone, {
        x: xRight,
        y: yRight,
        size: 11,
        font,
      });
      yRight -= 14;
    }
    if (sender.email) {
      page.drawText("Email: " + sender.email, { x: xRight, y: yRight, size: 11, font });
      yRight -= 14;
    }
    // City + Date line
    const today = new Date().toISOString().slice(0, 10);
    let city = sender.city;
    if (!city && sender.address) {
      const m = sender.address.match(/\b\d{5}\s+([A-Za-zÄÖÜäöüß\- ]{2,})\b/);
      if (m) city = m[1].trim();
    }
    const dateLine = (city ? city + ", " : "") + today;
    page.drawText(dateLine, { x: xRight, y: yRight, size: 11, font });
    yRight -= 14;
  }
  const titleDe =
    kind === "joint"
      ? "Anschreiben – Gemeinsame Sorge"
      : kind === "contact"
        ? "Anschreiben – Umgangsregelung"
        : kind === "mediation"
          ? "Anschreiben – Mediation"
          : "Anschreiben – Wenn Umgang blockiert";
  const titleEn =
    kind === "joint"
      ? "Cover Letter – Joint Custody"
      : kind === "contact"
        ? "Cover Letter – Contact Order"
        : kind === "mediation"
          ? "Cover Letter – Mediation"
          : "Cover Letter – If Contact Is Blocked";
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
      : kind === "contact"
        ? "Betreff: Antrag auf Umgangsregelung."
        : kind === "mediation"
          ? "Betreff: Bitte um Termin zur Mediation (Elternvereinbarung)."
          : "Betreff: Umgang wird blockiert – Bitte um Unterstützung/weiteres Vorgehen.",
    sender?.fullName ? `Absender: ${sender.fullName}` : "",
    sender?.phone || sender?.email
      ? `Kontakt: ${sender.phone ? `Telefon ${sender.phone}` : ""}${
          sender.phone && sender.email ? ", " : ""
        }${sender.email ? `Email ${sender.email}` : ""}`
      : "",
    (() => {
      let c = sender?.city;
      if (!c && sender?.address) {
        const m = sender.address.match(/\b\d{5}\s+([A-Za-zÄÖÜäöüß\- ]{2,})\b/);
        if (m) c = m[1].trim();
      }
      return c ? `Ort/Datum: ${c}, ${date}` : "";
    })(),
  ];
  const bodyEn = [
    `Date: ${date}`,
    "",
    "Please find enclosed the attached documents.",
    kind === "joint"
      ? "Subject: Joint parental custody application."
      : kind === "contact"
        ? "Subject: Contact/visitation order application."
        : kind === "mediation"
          ? "Subject: Request for mediation appointment (parenting agreement)."
          : "Subject: Contact is being blocked — request for support/next steps.",
    sender?.fullName ? `Sender: ${sender.fullName}` : "",
    sender?.phone || sender?.email
      ? `Contact: ${sender.phone ? `Phone ${sender.phone}` : ""}${
          sender.phone && sender.email ? ", " : ""
        }${sender.email ? `Email ${sender.email}` : ""}`
      : "",
    (() => {
      let c = sender?.city;
      if (!c && sender?.address) {
        const m = sender.address.match(/\b\d{5}\s+([A-Za-zÄÖÜäöüß\- ]{2,})\b/);
        if (m) c = m[1].trim();
      }
      return c ? `City/Date: ${c}, ${date}` : "";
    })(),
  ];
  const body = (locale === "de" ? bodyDe : bodyEn).join("\n");
  for (const line of body.split("\n")) {
    page.drawText(line, { x: marginX, y, size: 11, font });
    y -= 14;
  }
  y -= 6;
  page.drawText(locale === "de" ? "Anlagen:" : "Attachments:", { x: marginX, y, size: 11, font });
  y -= 14;
  const attachments = (() => {
    if (kind === "joint") {
      return [
        locale === "de" ? "Formular Antrag gemeinsame Sorge" : "Joint custody application form",
        locale === "de" ? "Geburtsurkunde(n)" : "Birth certificate(s)",
        locale === "de"
          ? "Vaterschaftsanerkennung (falls vorhanden)"
          : "Paternity acknowledgement (if any)",
        locale === "de" ? "Erstbesuch‑Checkliste (kurz)" : "First‑visit checklist (short)",
      ];
    }
    if (kind === "contact") {
      return [
        locale === "de" ? "Formular Umgangsregelung" : "Contact order form",
        locale === "de"
          ? "Kommunikationsprotokolle/Logs (Auszüge)"
          : "Communications/logs (excerpts)",
        locale === "de"
          ? "Nachweise Zahlungen (falls relevant)"
          : "Proof of payments (if relevant)",
        locale === "de" ? "Erstbesuch‑Checkliste (kurz)" : "First‑visit checklist (short)",
      ];
    }
    if (kind === "mediation") {
      return [
        locale === "de" ? "Kurzbeschreibung Anliegen" : "Brief problem summary",
        locale === "de" ? "Vorschlag Plan/Übergaben (Entwurf)" : "Draft schedule/handovers",
        locale === "de" ? "Erstbesuch‑Checkliste (kurz)" : "First‑visit checklist (short)",
      ];
    }
    // blocked
    return [
      locale === "de"
        ? "Kontakt‑Protokoll/Zeitleiste (Auszüge)"
        : "Contact log/timeline (excerpts)",
      locale === "de" ? "Nachweise (z. B. Nachrichten)" : "Evidence (e.g., messages)",
      locale === "de" ? "Erstbesuch‑Checkliste (kurz)" : "First‑visit checklist (short)",
    ];
  })();
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
