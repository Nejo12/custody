import { PDFDocument, StandardFonts, PDFFont } from "pdf-lib";
import type { Citation, FormData, ErrorWithMessage } from "@/types";

type Parent = { fullName?: string; address?: string };
type Sender = {
  fullName?: string;
  address?: string;
  phone?: string;
  email?: string;
  city?: string;
};
type Child = { fullName?: string; dob?: string; birthRegistryRef?: string };
type Court = { name?: string; address?: string };
type PartyRole = "parentA" | "parentB";
type GSForm = FormData & {
  parentA?: Parent;
  parentB?: Parent;
  children?: Child[];
  court?: Court;
  roles?: { applicant?: PartyRole; respondent?: PartyRole };
  place?: string;
  dateISO?: string;
  sender?: Sender;
};

type RequestBody = {
  formData?: GSForm;
  citations?: Citation[] | string[];
  snapshotIds?: string[];
  locale?: string;
  timelineText?: string;
};

export async function POST(req: Request) {
  try {
    const body: RequestBody = await req.json();
    const {
      formData = {},
      citations = [],
      snapshotIds = [],
      locale = "de",
      timelineText = "",
    } = body;
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    let page = doc.addPage([595.28, 841.89]); // A4

    const title = locale === "de" ? "Antrag auf gemeinsame Sorge" : "Joint custody application";
    const marginX = 50;
    const marginY = 40;
    const yStart = 800 - marginY;
    // PDF metadata for testability/searchability
    doc.setTitle(title);
    doc.setSubject(
      locale === "de"
        ? "Amtsgericht – Familiengericht; Antrag; Begründung; Anlagen; Unterschrift"
        : "Local Court – Family Court; Request; Reasoning; Attachments; Signature"
    );
    doc.setKeywords([
      title,
      locale === "de" ? "Amtsgericht" : "Court",
      locale === "de" ? "Antragsteller" : "Applicant",
      locale === "de" ? "Antragsgegner" : "Respondent",
      locale === "de" ? "Unterschrift" : "Signature",
    ]);
    page.drawText(
      locale === "de"
        ? "An das Amtsgericht – Familiengericht"
        : "To the Local Court – Family Court",
      { x: marginX, y: 800 - marginY + 40, size: 10, font }
    );
    page.drawText(title, { x: marginX, y: 800 - marginY + 25, size: 16, font });
    let y = yStart;
    // Structured sections
    const parentA = formData.parentA || {};
    const parentB = formData.parentB || {};
    const children = formData.children || [];
    const court = resolveCourt(formData);
    const roles = formData.roles || {};

    const drawHeading = (text: string) => {
      if (y < marginY + 20) {
        page = doc.addPage([595.28, 841.89]);
        y = yStart;
      }
      page.drawText(text, { x: marginX, y, size: 12, font });
      y -= 16;
    };
    const drawField = (label: string, value?: string) => {
      if (!value) return;
      const maxWidth = 595.28 - marginX * 2;
      const lines = wrapText(`${label}${label ? ": " : ""}${value}`, maxWidth, font, 10);
      for (const line of lines) {
        if (y < marginY + 10) {
          page = doc.addPage([595.28, 841.89]);
          y = yStart;
        }
        page.drawText(line, { x: marginX + 10, y, size: 10, font });
        y -= 12;
      }
    };
    const drawCheckbox = (label: string) => {
      if (y < marginY + 12) {
        page = doc.addPage([595.28, 841.89]);
        y = yStart;
      }
      page.drawRectangle({ x: marginX + 10, y: y - 10, width: 10, height: 10, borderWidth: 1 });
      page.drawText(label, { x: marginX + 26, y: y - 2, size: 10, font });
      y -= 14;
    };

    // Sender (optional)
    if (formData.sender && (formData.sender.fullName || formData.sender.address)) {
      const s = formData.sender;
      drawHeading(locale === "de" ? "Absender" : "Sender");
      if (s.fullName) drawField(locale === "de" ? "Name" : "Name", s.fullName);
      if (s.address) drawField(locale === "de" ? "Adresse" : "Address", s.address);
      if (s.phone || s.email) {
        const contact = `${s.phone ? (locale === "de" ? "Telefon " : "Phone ") + s.phone : ""}${
          s.phone && s.email ? ", " : ""
        }${s.email ? "Email " + s.email : ""}`;
        drawField(locale === "de" ? "Kontakt" : "Contact", contact);
      }
    }

    // Court block
    drawHeading(locale === "de" ? "Gericht" : "Court");
    if (court.name) drawField(locale === "de" ? "Name" : "Name", court.name);
    if (court.address) drawField(locale === "de" ? "Adresse" : "Address", court.address);
    if (!court.name && !court.address) {
      drawField(
        locale === "de" ? "Beispiel" : "Example",
        locale === "de"
          ? "Amtsgericht Mitte, Littenstraße 12-17, 10179 Berlin"
          : "Local Court Mitte, Littenstraße 12-17, 10179 Berlin"
      );
    }

    // Parties
    drawHeading(locale === "de" ? "Elternteil A" : "Parent A");
    drawField(locale === "de" ? "Name" : "Name", String(parentA.fullName || ""));
    drawField(locale === "de" ? "Adresse" : "Address", String(parentA.address || ""));

    y -= 6;
    drawHeading(locale === "de" ? "Elternteil B" : "Parent B");
    drawField(locale === "de" ? "Name" : "Name", String(parentB.fullName || ""));
    drawField(locale === "de" ? "Adresse" : "Address", String(parentB.address || ""));

    // Roles table (two-column)
    y -= 6;
    drawHeading(locale === "de" ? "Parteien" : "Parties");
    const col1x = marginX + 10;
    const col2x = marginX + 220;
    const rowH = 14;
    const labelApplicant = locale === "de" ? "Antragsteller" : "Applicant";
    const labelRespondent = locale === "de" ? "Antragsgegner" : "Respondent";
    const valApplicant =
      roles.applicant === "parentA"
        ? parentA.fullName || "Elternteil A"
        : roles.applicant === "parentB"
          ? parentB.fullName || "Elternteil B"
          : "";
    const valRespondent =
      roles.respondent === "parentA"
        ? parentA.fullName || "Elternteil A"
        : roles.respondent === "parentB"
          ? parentB.fullName || "Elternteil B"
          : "";
    // Draw headers (labels contain the words for testability)
    page.drawText(labelApplicant, { x: col1x, y, size: 10, font });
    page.drawText(labelRespondent, { x: col2x, y, size: 10, font });
    y -= rowH;
    page.drawText(valApplicant, { x: col1x, y, size: 10, font });
    page.drawText(valRespondent, { x: col2x, y, size: 10, font });
    y -= 2;

    y -= 6;
    drawHeading(locale === "de" ? "Kinder" : "Children");
    if (Array.isArray(children) && children.length > 0) {
      const max = Math.min(children.length, 4);
      for (let i = 0; i < max; i++) {
        const ch = children[i] || {};
        const nm = String(ch.fullName || "");
        const dob = String(ch.dob || "");
        const line = `${i + 1}. ${nm} ${dob ? "(" + dob + ")" : ""}`;
        drawField(locale === "de" ? "Kind" : "Child", line);
      }
    } else {
      drawField("", locale === "de" ? "(keine Angaben)" : "(no entries)");
    }

    // Antrag (request)
    y -= 6;
    drawHeading(locale === "de" ? "Antrag" : "Request");
    drawField(
      "",
      locale === "de"
        ? "Es wird beantragt, den Eltern die gemeinsame elterliche Sorge gemäß § 1626a BGB zu übertragen."
        : "It is requested to order joint parental custody pursuant to § 1626a BGB."
    );
    // Begründung (reasoning)
    y -= 6;
    drawHeading(locale === "de" ? "Begründung (Kurzangaben)" : "Reasoning (Summary)");
    drawField(
      "",
      locale === "de"
        ? "Vaterschaft ist anerkannt; eine gemeinsame Sorgeerklärung liegt nicht vor; dem Antrag stehen keine Kindeswohlgründe entgegen."
        : "Paternity is acknowledged; no joint custody declaration exists; no child-welfare grounds known against the request."
    );
    // Anlagen (attachments)
    y -= 6;
    drawHeading(locale === "de" ? "Anlagen" : "Attachments");
    drawCheckbox(locale === "de" ? "Geburtsurkunde(n)" : "Birth certificate(s)");
    drawCheckbox(locale === "de" ? "Vaterschaftsanerkennung" : "Paternity acknowledgement");
    drawCheckbox(locale === "de" ? "Kommunikation/Logs" : "Communications/Logs");
    // Tiny first-visit checklist hint
    drawField(
      "",
      locale === "de"
        ? "Erster Besuch – Checkliste: Ausweise, Geburtsurkunde, Vaterschaftsanerkennung."
        : "First visit – checklist: IDs, birth certificate, paternity acknowledgement."
    );

    // Signature block
    y -= 10;
    drawHeading(locale === "de" ? "Unterschrift" : "Signature");
    const dateText = formData.dateISO || new Date().toISOString().slice(0, 10);
    const placeText = formData.place || "";
    drawField(locale === "de" ? "Ort, Datum" : "Place, Date", `${placeText} ${dateText}`.trim());
    drawField(
      locale === "de" ? "Unterschrift Antragsteller(in)" : "Applicant signature",
      "____________________________"
    );

    // Footer
    const date = new Date().toISOString().slice(0, 10);
    const sourcesStr = citations
      .map((c): string => {
        if (typeof c === "string") return c;
        return c.label || c.url || "";
      })
      .join(", ");
    const snapshotStr = snapshotIds.join(", ");
    const footer = `Generated on ${date}. Sources: ${sourcesStr}. Snapshots: ${snapshotStr}. Information, not legal advice.`;
    page.drawText(footer.slice(0, 240), { x: marginX, y: marginY, size: 8, font });

    // Optional timeline last page
    if (timelineText && timelineText.trim().length > 0) {
      page = doc.addPage([595.28, 841.89]);
      let y = 800 - 40;
      page.drawText(locale === "de" ? "Zeitleiste (Auszug)" : "Timeline (excerpt)", {
        x: 50,
        y: 800 - 40 + 10,
        size: 12,
        font,
      });
      const lines = wrapText(timelineText.slice(0, 4000), 595.28 - 100, font, 10);
      for (const ln of lines) {
        if (y < 50) {
          page = doc.addPage([595.28, 841.89]);
          y = 800 - 40;
        }
        page.drawText(ln, { x: 50, y, size: 10, font });
        y -= 12;
      }
    }

    const bytes = await doc.save();
    return new Response(Buffer.from(bytes), { headers: { "Content-Type": "application/pdf" } });
  } catch (e) {
    const error = e as ErrorWithMessage;
    return new Response(JSON.stringify({ error: error?.message || "Invalid request" }), {
      status: 400,
    });
  }
}

function resolveCourt(formData: { court?: Court; courtTemplate?: string }): Court {
  if (formData.court && (formData.court.name || formData.court.address)) return formData.court;
  const t = formData.courtTemplate;
  switch (t) {
    case "berlin-mitte":
      return {
        name: "Amtsgericht Mitte (Familiengericht)",
        address: "Littenstraße 12–17, 10179 Berlin",
      };
    case "berlin-pankow":
      return {
        name: "Amtsgericht Pankow/Weißensee (Familiengericht)",
        address: "Parkstraße 71, 13086 Berlin",
      };
    case "hamburg":
      return {
        name: "Amtsgericht Hamburg (Familiengericht)",
        address: "Sievekingplatz 1, 20355 Hamburg",
      };
    case "koeln":
      return {
        name: "Amtsgericht Köln (Familiengericht)",
        address: "Luxemburger Straße 101, 50939 Köln",
      };
    case "duesseldorf":
      return {
        name: "Amtsgericht Düsseldorf (Familiengericht)",
        address: "Cecilienallee 3, 40474 Düsseldorf",
      };
    case "essen":
      return { name: "Amtsgericht Essen (Familiengericht)", address: "Burgplatz 2, 45127 Essen" };
    case "dortmund":
      return {
        name: "Amtsgericht Dortmund (Familiengericht)",
        address: "Luisenstraße 2-4, 44135 Dortmund",
      };
    case "bonn":
      return {
        name: "Amtsgericht Bonn (Familiengericht)",
        address: "Wilhelmstraße 21, 53111 Bonn",
      };
    case "wuppertal":
      return {
        name: "Amtsgericht Wuppertal (Familiengericht)",
        address: "Eiland 10, 42103 Wuppertal",
      };
    case "bochum":
      return {
        name: "Amtsgericht Bochum (Familiengericht)",
        address: "Viktoriastraße 14, 44787 Bochum",
      };
    default:
      return {};
  }
}

function wrapText(text: string, maxWidth: number, font: PDFFont, size: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    const width = font.widthOfTextAtSize(test, size);
    if (width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}
