// Use legacy build for Node to avoid DOMMatrix issues
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs";
// Attempt to configure worker for Node
(async () => {
  try {
    // @ts-expect-error - pdfjs-dist worker module lacks type definitions
    const worker = await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
    GlobalWorkerOptions.workerSrc = (worker.default || worker) as string;
  } catch {
    // ignore
  }
})();

interface TextItem {
  str?: string;
  [key: string]: unknown;
}

export async function extractPdfText(bytes: ArrayBuffer): Promise<string> {
  const loadingTask = getDocument({ data: new Uint8Array(bytes) });
  const pdf = await loadingTask.promise;
  const textParts: string[] = [];
  const pageCount = Math.min(pdf.numPages, 5);
  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items
      .map((it: TextItem) => ("str" in it ? it.str : ""))
      .filter(Boolean);
    textParts.push(strings.join(" "));
  }
  return textParts.join("\n");
}
