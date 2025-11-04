import JSZip from "jszip";
import type { InterviewState, Entry } from "@/store/app";

export type ExportData = {
  locale: string;
  interview: InterviewState;
  vault: { entries: Entry[] };
};

function base64ToUint8Array(base64: string): Uint8Array {
  if (typeof atob === "function") {
    const bin = atob(base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }
  // Node fallback
  return Uint8Array.from(Buffer.from(base64, "base64"));
}

export async function buildZipExport(data: ExportData): Promise<Uint8Array> {
  const zip = new JSZip();
  const meta = {
    generatedAt: new Date().toISOString(),
    app: "custody-clarity",
    version: "0.1.0",
  };
  const json = JSON.stringify({ meta, ...data }, null, 2);
  zip.file("export.json", json);

  const filesFolder = zip.folder("files");
  for (const e of data.vault.entries) {
    if (e.type === "file" && e.payload?.base64 && typeof e.payload.base64 === "string") {
      const safeTitle = e.title.replace(/[^a-zA-Z0-9_.-]/g, "_");
      const name = `${e.id}-${safeTitle}`;
      const bytes = base64ToUint8Array(e.payload.base64);
      filesFolder?.file(name, bytes);
    }
  }

  return await zip.generateAsync({ type: "uint8array" });
}
