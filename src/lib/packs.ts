import JSZip from "jszip";
import { buildCoverLetter, type Sender } from "@/lib/coverLetter";

async function generatePdf(kind: "joint" | "contact", locale: string, courtTemplate?: string) {
  const url = kind === "joint" ? "/api/pdf/gemeinsame-sorge" : "/api/pdf/umgangsregelung";
  const body =
    kind === "joint"
      ? { formData: { courtTemplate }, citations: [], snapshotIds: [], locale }
      : {
          formData: {
            courtTemplate,
            proposal: { weekday: {}, weekend: {}, holidays: {}, handover: {} },
          },
          citations: [],
          snapshotIds: [],
          locale,
        };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return await res.blob();
}

export async function buildPackZip(
  kind: "joint" | "contact" | "mediation" | "blocked",
  locale: string,
  sender?: Sender,
  courtTemplate?: string
): Promise<Blob> {
  const zip = new JSZip();

  // Cover
  const pdfCover = await buildCoverLetter(kind, locale, courtTemplate, sender);
  zip.file("cover-letter.pdf", pdfCover);
  // Main PDF for joint/contact
  if (kind === "joint" || kind === "contact") {
    const pdf = await generatePdf(kind, locale, courtTemplate);
    const buf = await pdf.arrayBuffer();
    zip.file(kind === "joint" ? "gemeinsame-sorge.pdf" : "umgangsregelung.pdf", buf);
  }
  // Checklist
  const checklist =
    kind === "joint"
      ? `Bring This Checklist\n- IDs\n- Birth certificate(s)\n- Paternity acknowledgement (if applicable)`
      : kind === "contact"
        ? `Bring This Checklist\n- IDs\n- Proposed schedule\n- Communication log excerpts`
        : `Bring This Checklist\n- IDs\n- Summary of issues\n- Draft schedule`;
  zip.file("checklist.txt", checklist);
  return await zip.generateAsync({ type: "blob" });
}
