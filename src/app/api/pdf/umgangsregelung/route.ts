import { NextRequest } from 'next/server';
import { PDFDocument, StandardFonts, PDFFont } from 'pdf-lib';
import type { Citation, ErrorWithMessage } from '@/types';
import type { Schedule } from '@/lib/schedule';

type RequestBody = {
  formData?: { proposal?: Schedule } & Record<string, unknown>;
  citations?: Citation[] | string[];
  snapshotIds?: string[];
  locale?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const { formData = {}, citations = [], snapshotIds = [], locale = 'de' } = body;
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    let page = doc.addPage([595.28, 841.89]);

    const title = locale === 'de' ? 'Antrag auf Umgangsregelung' : 'Contact/Visitation order application';
    page.drawText(title, { x: 50, y: 800, size: 16, font });

    const marginX = 50;
    const marginY = 40;
    const yStart = 800 - marginY;
    let y = yStart;

    const drawHeading = (text: string) => {
      if (y < marginY + 20) { page = doc.addPage([595.28, 841.89]); y = yStart; }
      page.drawText(text, { x: marginX, y, size: 12, font });
      y -= 16;
    };

    const drawField = (label: string, value: string) => {
      if (!value) return;
      const maxWidth = 595.28 - marginX * 2;
      const lines = wrapText(`${label}: ${value}`, maxWidth, font, 10);
      for (const line of lines) {
        if (y < marginY + 10) { page = doc.addPage([595.28, 841.89]); y = yStart; }
        page.drawText(line, { x: marginX + 10, y, size: 10, font });
        y -= 12;
      }
    };
    // Render schedule if provided
    const proposal = formData.proposal;
    if (proposal && proposal.weekday) {
      drawHeading(locale === 'de' ? 'Vorgeschlagener Umgang' : 'Proposed schedule');
      const wd = proposal.weekday;
      const rows: Array<[string, string | undefined]> = [
        ['Mon', wd.monday], ['Tue', wd.tuesday], ['Wed', wd.wednesday],
        ['Thu', wd.thursday], ['Fri', wd.friday], ['Sat', wd.saturday], ['Sun', wd.sunday],
      ];
      for (const [label, val] of rows) {
        drawField(label, String(val || '-'));
      }
      const weekend = proposal.weekend || {};
      drawField(locale==='de'?'Wochenende (gerade)':'Weekend even', String(weekend.even || '-'));
      drawField(locale==='de'?'Wochenende (ungerade)':'Weekend odd', String(weekend.odd || '-'));
      const handover = proposal.handover || {};
      if (handover.location) drawField(locale==='de'?'Übergabe':'Handover', handover.location);
    } else {
      const entries = Object.entries(formData);
      for (const [k, v] of entries.slice(0, 24)) {
        drawField(k, typeof v === 'string' ? v : JSON.stringify(v));
      }
    }

    const date = new Date().toISOString().slice(0, 10);
    const sourcesStr = citations.map((c): string => {
      if (typeof c === 'string') return c;
      return c.label || c.url || '';
    }).join(', ');
    const snapshotStr = snapshotIds.join(', ');
    const footer = `Generated on ${date}. Sources: ${sourcesStr}. Snapshots: ${snapshotStr}. Information, not legal advice.`;
    page.drawText(footer.slice(0, 240), { x: marginX, y: marginY, size: 8, font });

    const bytes = await doc.save();
    return new Response(Buffer.from(bytes), { headers: { 'Content-Type': 'application/pdf' } });
  } catch (e) {
    const error = e as ErrorWithMessage;
    return new Response(JSON.stringify({ error: error?.message || 'Invalid request' }), { status: 400 });
  }
}

function wrapText(text: string, maxWidth: number, font: PDFFont, size: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
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
