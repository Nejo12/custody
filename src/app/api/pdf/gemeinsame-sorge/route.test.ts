import { describe, it, expect } from "vitest";
import { POST } from "./route";

function toText(buf: ArrayBuffer): string {
  const dec = new TextDecoder();
  return dec.decode(new Uint8Array(buf));
}

describe("gemeinsame sorge PDF timeline", () => {
  it("embeds timeline page when provided", async () => {
    const body = {
      formData: {},
      citations: [],
      snapshotIds: [],
      locale: "en",
      timelineText: "Test timeline entry",
    };
    const req = new Request("http://localhost/api/pdf/gemeinsame-sorge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const res = await POST(req);
    expect(res.ok).toBe(true);
    const ab = await res.arrayBuffer();
    const txt = toText(ab);
    expect(txt.includes("Timeline (excerpt)") || txt.includes("Zeitleiste (Auszug)")).toBe(true);
  });
});
