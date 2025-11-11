"use client";
import { useEffect, useState } from "react";
import { anonymizeText } from "@/lib/anonymize";
import { useAppStore } from "@/store/app";
import { useI18n } from "@/i18n";

export const dynamic = "force-dynamic";

type Fields = {
  fullName?: string;
  address?: string;
  dateOfBirth?: string;
  phone?: string;
  email?: string;
  city?: string;
};

export default function ScanPage() {
  const { t } = useI18n();
  const { addEntry, blurThumbnails } = useAppStore();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [redacted, setRedacted] = useState<string>("");
  const [fields, setFields] = useState<Fields>({});
  const [lang, setLang] = useState<"eng" | "deu" | "auto">("eng");
  const [usedLang, setUsedLang] = useState<string>("");
  const [preloadedDeu, setPreloadedDeu] = useState(false);

  // Lazy preload German model once selected for faster subsequent scans
  useEffect(() => {
    if (preloadedDeu) return;
    if (lang === "deu" || lang === "auto") {
      (async () => {
        try {
          const { createWorker } = await import("tesseract.js");
          const worker = await createWorker("deu");
          const tinyPng =
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAgMBg0sNn5wAAAAASUVORK5CYII=";
          await worker.recognize(tinyPng);
          await worker.terminate();
          setPreloadedDeu(true);
        } catch {
          /* ignore preload errors */
        }
      })();
    }
  }, [lang, preloadedDeu]);

  function onPick(ev: React.ChangeEvent<HTMLInputElement>) {
    const f = ev.target.files?.[0] || null;
    setFile(f);
    setText("");
    setRedacted("");
    setFields({});
    if (f) setPreview(URL.createObjectURL(f));
  }

  function extractFields(raw: string): Fields {
    const lines = raw.split(/\n+/).map((l) => l.trim());
    let fullName: string | undefined;
    let address: string | undefined;
    let dateOfBirth: string | undefined;
    let phone: string | undefined;
    let email: string | undefined;
    let city: string | undefined;
    for (const ln of lines) {
      if (!fullName && /(name|full name|vorname|nachname)[:\s]/i.test(ln)) {
        fullName = ln.replace(/^(name|full name|vorname|nachname)[:\s-]*/i, "").trim();
      }
      if (!address && /(address|adresse|anschrift)[:\s]/i.test(ln)) {
        address = ln.replace(/^(address|adresse|anschrift)[:\s-]*/i, "").trim();
      }
      if (!dateOfBirth && /(geburtsdatum|date of birth|dob)[:\s]/i.test(ln)) {
        dateOfBirth = ln.replace(/^(geburtsdatum|date of birth|dob)[:\s-]*/i, "").trim();
      }
      if (!email) {
        const m = ln.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
        if (m) email = m[0];
      }
      if (!phone) {
        const p = ln.match(/\+?\d[\d\s().-]{6,}\d/);
        if (p) phone = p[0];
      }
      if (!city) {
        const cm = ln.match(/\b(\d{5})\s+([A-Za-zÄÖÜäöüß\- ]{2,})\b/);
        if (cm) city = cm[2].trim();
      }
    }
    return { fullName, address, dateOfBirth, phone, email, city };
  }

  async function onRecognize() {
    try {
      setBusy(true);
      setError("");
      if (!file) throw new Error("No image selected");
      const { createWorker } = await import("tesseract.js");
      const sel = lang === "auto" ? "deu+eng" : lang;

      // Create worker with only the needed language(s)
      const worker = await createWorker(sel);
      const result = await worker.recognize(file);
      let data = result.data;
      let raw = (data?.text || "").trim();
      let conf = typeof data?.confidence === "number" ? data.confidence : 0;
      let finalLang = sel;

      // If confidence is low and not already using German, try German
      if (conf < 55 && sel !== "deu") {
        await worker.terminate();
        const workerDeu = await createWorker("deu");
        const re = await workerDeu.recognize(file);
        const c2 = typeof re.data?.confidence === "number" ? re.data.confidence : 0;
        if (c2 > conf) {
          data = re.data;
          raw = (re.data?.text || "").trim();
          conf = c2;
          finalLang = "deu";
        }
        await workerDeu.terminate();
      } else {
        await worker.terminate();
      }

      setUsedLang(finalLang);
      setText(raw);
      const red = anonymizeText(raw);
      setRedacted(red);
      setFields(extractFields(raw));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "OCR failed";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  function onSave() {
    if (!redacted) return;
    addEntry({
      id: crypto.randomUUID(),
      type: "note",
      title: "OCR intake",
      timestamp: Date.now(),
      payload: { content: redacted, fields },
    });
    alert(t.vault?.savedToVault || "Saved to Vault");
  }

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-semibold">{t.vault.scanner || "Intake scanner"}</h1>
      <div className="space-y-3 rounded-lg border p-3">
        <label className="inline-flex items-center gap-2 underline text-sm cursor-pointer">
          {t.ocr?.selectImage || "Select photo"}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={onPick}
          />
        </label>
        <div className="flex items-center gap-2 text-sm">
          <label className="text-xs">{t.ocr?.lang || "Language"}</label>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as typeof lang)}
            className="rounded border px-2 py-1 text-sm"
          >
            <option value="eng">{t.ocr?.langEnglish || "English"}</option>
            <option value="deu">{t.ocr?.langGerman || "German"}</option>
            <option value="auto">{t.ocr?.langAuto || "Auto (EN+DE)"}</option>
          </select>
        </div>
        {preview && (
          <div className="relative w-full h-56 overflow-hidden rounded border bg-zinc-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="preview"
              className={`object-contain w-full h-full ${blurThumbnails ? "blur-sm" : ""}`}
            />
          </div>
        )}
        <button
          onClick={onRecognize}
          disabled={!file || busy}
          className="rounded-lg border px-3 py-1 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50"
        >
          {busy ? t.ocr?.recognizing || "Recognizing…" : t.ocr?.recognize || "Recognize text"}
        </button>
        {error && <div className="text-xs text-red-600">{error}</div>}
      </div>
      {(redacted || text) && (
        <div className="rounded-lg border p-3 space-y-2">
          <div className="text-sm font-medium">{t.ocr?.redactedPreview || "Redacted preview"}</div>
          <pre className="whitespace-pre-wrap text-xs bg-zinc-50 dark:bg-zinc-900 rounded p-2 max-h-48 overflow-auto">
            {redacted || text}
          </pre>
          {usedLang && <div className="text-[11px] text-zinc-500">{`OCR model: ${usedLang}`}</div>}
          <div className="text-sm font-medium">{t.ocr?.extractedFields || "Extracted fields"}</div>
          <div className="text-xs text-zinc-700 dark:text-zinc-500">
            {fields.fullName && (
              <div>
                <span className="font-medium">Full name:</span> {fields.fullName}
              </div>
            )}
            {fields.address && (
              <div>
                <span className="font-medium">Address:</span> {fields.address}
              </div>
            )}
            {fields.city && (
              <div>
                <span className="font-medium">City:</span> {fields.city}
              </div>
            )}
            {fields.phone && (
              <div>
                <span className="font-medium">Phone:</span> {fields.phone}
              </div>
            )}
            {fields.email && (
              <div>
                <span className="font-medium">Email:</span> {fields.email}
              </div>
            )}
            {fields.dateOfBirth && (
              <div>
                <span className="font-medium">Date of birth:</span> {fields.dateOfBirth}
              </div>
            )}
            {!fields.fullName &&
              !fields.address &&
              !fields.dateOfBirth &&
              !fields.phone &&
              !fields.email &&
              !fields.city && <div>—</div>}
          </div>
          <button
            onClick={onSave}
            disabled={!redacted}
            className="rounded-lg border px-3 py-1 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            {t.ocr?.saveToVault || "Save to Vault"}
          </button>
        </div>
      )}
    </div>
  );
}
