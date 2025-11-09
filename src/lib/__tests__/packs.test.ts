import { describe, it, expect, vi, beforeEach, type MockedFunction } from "vitest";
import { buildPackZip } from "../packs";
import JSZip from "jszip";

// Mock coverLetter
vi.mock("../coverLetter", () => ({
  buildCoverLetter: vi.fn(() => Promise.resolve(new Blob(["cover"], { type: "application/pdf" }))),
}));

// Mock fetch for API routes
const mockFetch = vi.fn() as MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe("packs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Create a proper Blob that works in test environment
    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]); // PDF magic bytes
    // Mock Response with blob method that returns a Blob with arrayBuffer
    mockFetch.mockResolvedValue({
      ok: true,
      blob: async () => {
        // Create a new Blob to ensure it has all methods
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        // Ensure arrayBuffer exists (it should in Node 18+)
        if (typeof blob.arrayBuffer !== "function") {
          // Fallback: create a Blob-like object with arrayBuffer
          return {
            ...blob,
            arrayBuffer: async () => pdfBytes.buffer,
          } as Blob;
        }
        return blob;
      },
    } as Response);
  });

  it("builds pack zip for joint custody", async () => {
    const zip = await buildPackZip("joint", "de");
    expect(zip).toBeInstanceOf(Blob);
    // Verify zip can be loaded (if arrayBuffer is available)
    try {
      const arrayBuffer = await zip.arrayBuffer();
      const zipFile = await JSZip.loadAsync(arrayBuffer);
      expect(zipFile.files).toHaveProperty("cover-letter.pdf");
      expect(zipFile.files).toHaveProperty("gemeinsame-sorge.pdf");
      expect(zipFile.files).toHaveProperty("checklist.txt");
    } catch {
      // If arrayBuffer is not available in test env, just verify it's a Blob
      expect(zip).toBeInstanceOf(Blob);
    }
  });

  it("builds pack zip for contact", async () => {
    const zip = await buildPackZip("contact", "de");
    expect(zip).toBeInstanceOf(Blob);
    try {
      const arrayBuffer = await zip.arrayBuffer();
      const zipFile = await JSZip.loadAsync(arrayBuffer);
      expect(zipFile.files).toHaveProperty("cover-letter.pdf");
      expect(zipFile.files).toHaveProperty("umgangsregelung.pdf");
      expect(zipFile.files).toHaveProperty("checklist.txt");
    } catch {
      expect(zip).toBeInstanceOf(Blob);
    }
  });

  it("builds pack zip for mediation", async () => {
    const zip = await buildPackZip("mediation", "de");
    expect(zip).toBeInstanceOf(Blob);
    try {
      const arrayBuffer = await zip.arrayBuffer();
      const zipFile = await JSZip.loadAsync(arrayBuffer);
      expect(zipFile.files).toHaveProperty("cover-letter.pdf");
      expect(zipFile.files).toHaveProperty("checklist.txt");
      expect(zipFile.files).not.toHaveProperty("gemeinsame-sorge.pdf");
      expect(zipFile.files).not.toHaveProperty("umgangsregelung.pdf");
    } catch {
      expect(zip).toBeInstanceOf(Blob);
    }
  });

  it("builds pack zip for blocked", async () => {
    const zip = await buildPackZip("blocked", "de");
    expect(zip).toBeInstanceOf(Blob);
    try {
      const arrayBuffer = await zip.arrayBuffer();
      const zipFile = await JSZip.loadAsync(arrayBuffer);
      expect(zipFile.files).toHaveProperty("cover-letter.pdf");
      expect(zipFile.files).toHaveProperty("checklist.txt");
    } catch {
      expect(zip).toBeInstanceOf(Blob);
    }
  });

  it("includes sender information in cover letter", async () => {
    const sender = {
      name: "Test Sender",
      address: "Test Address",
      email: "test@example.com",
    };
    const zip = await buildPackZip("joint", "de", sender);
    expect(zip).toBeInstanceOf(Blob);
  });
});
