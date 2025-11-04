export type ICSOptions = {
  summary: string;
  startISO: string; // ISO 8601
  durationMinutes?: number; // default 15
};

function formatICSDate(iso: string): string {
  // Convert to basic format YYYYMMDDTHHMMSSZ
  const clean = iso.replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  return clean.endsWith('Z') ? clean : `${clean}Z`;
}

export function buildICS(opts: ICSOptions): string {
  const start = formatICSDate(opts.startISO);
  const duration = `PT${Math.max(1, opts.durationMinutes ?? 15)}M`;
  const summary = opts.summary.replace(/\n+/g, ' ').slice(0, 120);
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Custody Clarity//EN',
    'BEGIN:VEVENT',
    `SUMMARY:${summary}`,
    `DTSTART:${start}`,
    `DURATION:${duration}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\n');
}

