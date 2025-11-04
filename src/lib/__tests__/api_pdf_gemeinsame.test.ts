import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { PDFDocument } from "pdf-lib";

describe("api/pdf/gemeinsame-sorge (DE layout)", () => {
  it("contains German headings in PDF bytes", async () => {
    const body = {
      formData: {
        parentA: { fullName: "Max Mustermann", address: "Musterstr. 1, Berlin" },
        parentB: { fullName: "Erika Musterfrau", address: "Beispielweg 2, Berlin" },
        children: [{ fullName: "K. Mustermann", dob: "2020-01-01" }],
      },
      citations: [],
      snapshotIds: [],
      locale: "de",
    };
    // Skip in sandboxed environments without tmp write permissions
    let canWrite = true;
    try {
      const p = path.join(process.cwd(), ".tmp");
      fs.mkdirSync(p, { recursive: true });
      fs.mkdtempSync(path.join(p, "probe-"));
    } catch {
      canWrite = false;
    }
    if (!canWrite) return; // skip

    const { POST } = await import("@/app/api/pdf/gemeinsame-sorge/route");
    const req = new Request("http://localhost/api/pdf/gemeinsame-sorge", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    const ab = await res.arrayBuffer();
    const doc = await PDFDocument.load(ab);
    expect(doc.getTitle()).toContain("Antrag auf gemeinsame Sorge");
    expect(doc.getSubject() || "").toContain("Amtsgericht");
    const keywords = doc.getKeywords();
    const keywordsArray = Array.isArray(keywords) ? keywords : keywords ? [keywords] : [];
    const kws = keywordsArray.join(" ");
    expect(kws).toContain("Antragsteller");
    expect(kws).toContain("Antragsgegner");
    expect(kws).toContain("Unterschrift");
  });
});
