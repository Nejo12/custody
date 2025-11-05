"use client";
import { useState } from "react";
import { anonymizeText } from "@/lib/anonymize";
import { useAppStore } from "@/store/app";
import { useI18n } from "@/i18n";

type Fields = { fullName?: string; address?: string; dateOfBirth?: string };

export default function ScanPage() {
  const { t } = useI18n();
  const { addEntry } = useAppStore();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [redacted, setRedacted] = useState<string>("");
  const [fields, setFields] = useState<Fields>({});
  const [lang, setLang] = useState<"eng" | "deu" | "auto">("eng");

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
    }
    return { fullName, address, dateOfBirth };
  }

  async function onRecognize() {
    try {
      setBusy(true);
      setError("");
      if (!file) throw new Error("No image selected");
      const { recognize } = await import("tesseract.js");
      const sel = lang === "auto" ? "deu+eng" : lang;
      const { data } = await recognize(file, sel);
      const raw = (data?.text || "").trim();
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
    alert("Saved to Vault");
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
            <img src={preview} alt="preview" className="object-contain w-full h-full" />
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
          <div className="text-sm font-medium">{t.ocr?.extractedFields || "Extracted fields"}</div>
          <div className="text-xs text-zinc-700 dark:text-zinc-300">
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
            {fields.dateOfBirth && (
              <div>
                <span className="font-medium">Date of birth:</span> {fields.dateOfBirth}
              </div>
            )}
            {!fields.fullName && !fields.address && !fields.dateOfBirth && <div>—</div>}
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
