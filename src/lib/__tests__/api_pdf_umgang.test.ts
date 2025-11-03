import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/pdf/umgangsregelung/route';
import { NextRequest } from 'next/server';
import { normalizeSchedule } from '@/lib/schedule';

describe('api/pdf/umgangsregelung', () => {
  it('returns a PDF response for valid payload', async () => {
    const body = {
      formData: { proposal: normalizeSchedule({ weekday: { monday: '16:00-19:00' } }) },
      citations: [],
      snapshotIds: [],
      locale: 'en',
    };
    const base = new Request('http://localhost/api/pdf/umgangsregelung', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
    const req = new NextRequest(base);
    const res = await POST(req);
    expect(res.headers.get('content-type')).toContain('application/pdf');
    const buf = await res.arrayBuffer();
    expect(buf.byteLength).toBeGreaterThan(100);
  });
});
