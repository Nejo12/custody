import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { normalizeSchedule } from '@/lib/schedule';
import { PDFDocument } from 'pdf-lib';

describe('api/pdf/umgangsregelung (DE layout)', () => {
  it('contains German headings in PDF bytes', async () => {
    const body = {
      formData: { proposal: normalizeSchedule({ weekday: { monday: '16:00-19:00' } }) },
      citations: [],
      snapshotIds: [],
      locale: 'de',
    };
    let canWrite = true;
    try {
      const p = path.join(process.cwd(), '.tmp');
      fs.mkdirSync(p, { recursive: true });
      fs.mkdtempSync(path.join(p, 'probe-'));
    } catch {
      canWrite = false;
    }
    if (!canWrite) return;

    const { POST } = await import('@/app/api/pdf/umgangsregelung/route');
    const req = new Request('http://localhost/api/pdf/umgangsregelung', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    const ab = await res.arrayBuffer();
    const doc = await PDFDocument.load(ab);
    expect(doc.getTitle()).toContain('Antrag auf Umgangsregelung');
    expect(doc.getSubject() || '').toContain('Amtsgericht');
    const keywords = doc.getKeywords();
    const keywordsArray = Array.isArray(keywords) ? keywords : keywords ? [keywords] : [];
    const kws = keywordsArray.join(' ');
    expect(kws).toContain('Vorgeschlagener Umgang');
    expect(kws).toContain('Einstweilige Anordnung');
    expect(kws).toContain('Unterschrift');
  });
});
