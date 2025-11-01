import { NextRequest } from 'next/server';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import type { Citation, FormData, ErrorWithMessage } from '@/types';

type RequestBody = {
  formData?: FormData;
  citations?: Citation[] | string[];
  snapshotIds?: string[];
  locale?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const { formData = {}, citations = [], snapshotIds = [], locale = 'de' } = body;
    const doc = await PDFDocument.create();
    const page = doc.addPage([595.28, 841.89]); // A4
    const font = await doc.embedFont(StandardFonts.Helvetica);

    const title = locale === 'de' ? 'Antrag auf gemeinsame Sorge' : 'Joint custody application';
    page.drawText(title, { x: 50, y: 800, size: 16, font });
    const yStart = 770;
    let y = yStart;
    const entries = Object.entries(formData);
    for (const [k, v] of entries.slice(0, 20)) {
      page.drawText(`${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`, { x: 50, y, size: 10, font });
      y -= 14;
    }

    // Footer
    const date = new Date().toISOString().slice(0, 10);
    const sourcesStr = citations.map((c): string => {
      if (typeof c === 'string') return c;
      return c.label || c.url || '';
    }).join(', ');
    const snapshotStr = snapshotIds.join(', ');
    const footer = `Generated on ${date}. Sources: ${sourcesStr}. Snapshots: ${snapshotStr}. Information, not legal advice.`;
    page.drawText(footer.slice(0, 240), { x: 50, y: 40, size: 8, font });

    const bytes = await doc.save();
    return new Response(Buffer.from(bytes), { headers: { 'Content-Type': 'application/pdf' } });
  } catch (e) {
    const error = e as ErrorWithMessage;
    return new Response(JSON.stringify({ error: error?.message || 'Invalid request' }), { status: 400 });
  }
}

