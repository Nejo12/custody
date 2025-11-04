import { describe, it, expect } from "vitest";
import { buildZipExport, type ExportData } from "@/lib/export";
import JSZip from "jszip";

function makeData(): ExportData {
  return {
    locale: "en",
    interview: { version: "2025-01-01", answers: { married_at_birth: "no" } },
    vault: {
      entries: [
        { id: "e1", type: "note" as const, title: "First note", timestamp: 1, payload: {} },
        {
          id: "e2",
          type: "file" as const,
          title: "doc.txt",
          timestamp: 2,
          payload: { base64: Buffer.from("hello").toString("base64"), type: "text/plain" },
        },
      ],
    },
  };
}

describe("buildZipExport", () => {
  it("produces a zip with export.json and files/", async () => {
    const bytes = await buildZipExport(makeData());
    expect(bytes.byteLength).toBeGreaterThan(100);
    const zip = await JSZip.loadAsync(bytes);
    const names = Object.keys(zip.files);
    expect(names).toContain("export.json");
    expect(names.some((n) => n.startsWith("files/"))).toBe(true);
    const exportJson = await zip.file("export.json")!.async("string");
    const parsed = JSON.parse(exportJson);
    expect(parsed.locale).toBe("en");
    expect(parsed.vault.entries.length).toBe(2);
  });
});
