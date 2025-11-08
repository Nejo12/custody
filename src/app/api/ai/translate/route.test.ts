import { describe, it, expect } from 'vitest';
import { POST } from './route';

describe('translate API', () => {
  it('returns disabled response when no API key', async () => {
    const req = new Request('http://localhost/api/ai/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Hallo', to: 'en', transliterate: true }),
    });
    const res = await POST(req as any);
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json).toHaveProperty('disabled', true);
    expect(json).toHaveProperty('text');
  });
});

