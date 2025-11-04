import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { normalizeSchedule } from "@/lib/schedule";

describe("api/pdf/umgangsregelung", () => {
  it("returns a PDF response for valid payload", async () => {
    const body = {
      formData: { proposal: normalizeSchedule({ weekday: { monday: "16:00-19:00" } }) },
      citations: [],
      snapshotIds: [],
      locale: "en",
    };
    let canWrite = true;
    try {
      const p = path.join(process.cwd(), ".tmp");
      fs.mkdirSync(p, { recursive: true });
      fs.mkdtempSync(path.join(p, "probe-"));
    } catch {
      canWrite = false;
    }
    if (!canWrite) return;

    const { POST } = await import("@/app/api/pdf/umgangsregelung/route");
    const req = new Request("http://localhost/api/pdf/umgangsregelung", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.headers.get("content-type")).toContain("application/pdf");
    const buf = await res.arrayBuffer();
    expect(buf.byteLength).toBeGreaterThan(100);
  });
});
