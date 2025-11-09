import { describe, it, expect } from "vitest";
import { POST } from "../logbook/route";
import { PDFDocument } from "pdf-lib";

describe("logbook PDF route", () => {
  it("generates PDF with text content", async () => {
    const req = new Request("http://localhost/api/pdf/logbook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines: "Test logbook entry\nAnother entry" }),
    });
    const res = await POST(req);
    expect(res.ok).toBe(true);
    expect(res.headers.get("Content-Type")).toBe("application/pdf");
    const arrayBuffer = await res.arrayBuffer();
    const doc = await PDFDocument.load(arrayBuffer);
    expect(doc.getPageCount()).toBeGreaterThan(0);
  });

  it("handles empty text", async () => {
    const req = new Request("http://localhost/api/pdf/logbook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines: "" }),
    });
    const res = await POST(req);
    expect(res.ok).toBe(true);
    const arrayBuffer = await res.arrayBuffer();
    const doc = await PDFDocument.load(arrayBuffer);
    expect(doc.getPageCount()).toBeGreaterThan(0);
  });

  it("handles long text with multiple pages", async () => {
    const longText = Array(100).fill("This is a test line for the logbook.").join("\n");
    const req = new Request("http://localhost/api/pdf/logbook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines: longText }),
    });
    const res = await POST(req);
    expect(res.ok).toBe(true);
    const arrayBuffer = await res.arrayBuffer();
    const doc = await PDFDocument.load(arrayBuffer);
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(1);
  });

  it("handles invalid request body", async () => {
    const req = new Request("http://localhost/api/pdf/logbook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "invalid json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
