import { describe, it, expect } from "vitest";
import { buildICS } from "@/lib/ics";

describe("buildICS", () => {
  it("produces a valid minimal ICS with summary, start and duration", () => {
    const iso = "2025-01-01T10:00:00.000Z";
    const ics = buildICS({ summary: "Call Jugendamt", startISO: iso, durationMinutes: 15 });
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("SUMMARY:Call Jugendamt");
    expect(ics).toContain("DTSTART:20250101T100000Z");
    expect(ics).toContain("DURATION:PT15M");
    expect(ics).toContain("END:VEVENT");
    expect(ics).toContain("END:VCALENDAR");
  });
});
