import { describe, it, expect } from 'vitest';
import { normalizeSchedule } from '@/lib/schedule';

describe('normalizeSchedule', () => {
  it('fills missing fields with empty values and includes weekends', () => {
    const s = normalizeSchedule({ weekday: { monday: '16:00-19:00' }, weekend: { even: 'Fri 16:00 → Sun 18:00' } });
    expect(s.weekday.monday).toBe('16:00-19:00');
    expect(s.weekday.tuesday).toBe('');
    expect(s.weekday.saturday).toBe('');
    expect(s.weekday.sunday).toBe('');
    expect(s.weekend.even).toMatch(/Fri/);
    expect(s.holidays).toEqual({});
    expect(s.handover.location).toBe('');
  });
});
