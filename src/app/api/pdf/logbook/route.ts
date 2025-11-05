import { PDFDocument, StandardFonts } from "pdf-lib";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { lines?: string };
    const txt = (body.lines || "").toString();
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    let page = doc.addPage([595.28, 841.89]);
    page.drawText("Logbook (facts-only)", { x: 50, y: 800, size: 14, font });
    let y = 780;
    const wrapText = (text: string, maxWidth: number): string[] => {
      const words = text.split(/\s+/);
      const lines: string[] = [];
      let line = "";
      for (const w of words) {
        const test = line ? line + " " + w : w;
        const width = font.widthOfTextAtSize(test, 10);
        if (width > maxWidth && line) {
          lines.push(line);
          line = w;
        } else {
          line = test;
        }
      }
      if (line) lines.push(line);
      return lines;
    };
    const lines = wrapText(txt, 595.28 - 100);
    for (const ln of lines) {
      if (y < 50) {
        page = doc.addPage([595.28, 841.89]);
        y = 800;
      }
      page.drawText(ln, { x: 50, y, size: 10, font });
      y -= 12;
    }
    const bytes = await doc.save();
    return new Response(Buffer.from(bytes), { headers: { "Content-Type": "application/pdf" } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unexpected error";
    return new Response(JSON.stringify({ error: msg }), { status: 400 });
  }
}
