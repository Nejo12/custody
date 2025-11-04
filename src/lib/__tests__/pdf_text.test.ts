import { describe, it, expect } from 'vitest';
import { POST as GS } from '@/app/api/pdf/gemeinsame-sorge/route';
import { POST as UM } from '@/app/api/pdf/umgangsregelung/route';
import { extractPdfText } from '@/lib/pdfText';

describe('PDF content includes key German terms', () => {
  it('Gemeinsame Sorge PDF contains Antragsteller/Antragsgegner/Unterschrift', async () => {
    const req = new Request('http://localhost/api/pdf/gemeinsame-sorge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formData: { roles: { applicant: 'parentA', respondent: 'parentB' } }, locale: 'de' }),
    });
    const res = await GS(req);
    const ab = await res.arrayBuffer();
    const text = await extractPdfText(ab);
    expect(text).toMatch(/Antragsteller/i);
    expect(text).toMatch(/Antragsgegner/i);
    expect(text).toMatch(/Unterschrift/i);
  });

  it('Umgangsregelung PDF contains Antragsteller/Antragsgegner/Unterschrift', async () => {
    const req = new Request('http://localhost/api/pdf/umgangsregelung', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formData: { roles: { applicant: 'parentA', respondent: 'parentB' } }, locale: 'de' }),
    });
    const res = await UM(req);
    const ab = await res.arrayBuffer();
    const text = await extractPdfText(ab);
    expect(text).toMatch(/Antragsteller/i);
    expect(text).toMatch(/Antragsgegner/i);
    expect(text).toMatch(/Unterschrift/i);
  });
});

