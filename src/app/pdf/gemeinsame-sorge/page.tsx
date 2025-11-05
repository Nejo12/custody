"use client";
import { useState } from "react";
import { useI18n } from "@/i18n";
import rules from "@/data/rules.json";
import type { SimpleRule, Citation } from "@/lib/rules";
import type { FormData } from "@/types";
import { useAppStore } from "@/store/app";

type FormState = {
  parentA: { fullName?: string; address?: string };
  parentB: { fullName?: string; address?: string };
  children: unknown[];
};

export default function GSPage() {
  const { t, locale } = useI18n();
  const [form, setForm] = useState<FormState>({ parentA: {}, parentB: {}, children: [] });
  const [courtTemplate, setCourtTemplate] = useState<string>("");
  const { setPreferredCourtTemplate, includeTimelineInPack, setIncludeTimelineInPack, vault } =
    useAppStore();
  const [downloading, setDownloading] = useState(false);
  const ocr = (() => {
    const e = vault.entries.find(
      (x) => x.type === "note" && (x.payload as { fields?: unknown }).fields
    );
    if (!e) return undefined as undefined | { fullName?: string; address?: string };
    const p = e.payload as { fields?: { fullName?: string; address?: string } };
    return p.fields;
  })();
  function applyOCRToParentA() {
    if (!ocr) return;
    setForm((prev) => ({
      ...prev,
      parentA: {
        ...prev.parentA,
        fullName: prev.parentA.fullName || ocr.fullName || "",
        address: prev.parentA.address || ocr.address || "",
      },
    }));
  }

  async function onDownload() {
    setDownloading(true);
    try {
      const rulesArray = rules as SimpleRule[];
      const citations: Citation[] =
        rulesArray[1]?.outcome?.citations?.filter(
          (c): c is Citation => typeof c === "object" && c !== null && "url" in c
        ) || [];
      const snapshotIds: string[] = (rulesArray[3]?.outcome?.citations || [])
        .filter((c): c is Citation => typeof c === "object" && c !== null && "url" in c)
        .map((c: Citation) => c.snapshotId)
        .filter((id): id is string => typeof id === "string");

      const res = await fetch("/api/pdf/gemeinsame-sorge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData: { ...form, courtTemplate } as FormData,
          citations,
          snapshotIds,
          locale,
        }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gemeinsame-sorge-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-semibold">{t.result.generateJointCustody}</h1>
      <div className="space-y-2">
        {ocr && (
          <button type="button" onClick={applyOCRToParentA} className="text-sm underline">
            Prefill Parent A from OCR
          </button>
        )}
        <label className="block text-sm mt-2">
          {t.result.courtTemplate}
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={courtTemplate}
            onChange={(e) => {
              setCourtTemplate(e.target.value);
              setPreferredCourtTemplate(e.target.value);
            }}
          >
            <option value="">{t.result.courtTemplateNone}</option>
            <optgroup label="Berlin">
              <option value="berlin-mitte">Berlin – Amtsgericht Mitte</option>
              <option value="berlin-pankow">Berlin – Amtsgericht Pankow/Weißensee</option>
            </optgroup>
            <optgroup label="Hamburg">
              <option value="hamburg">Hamburg – Amtsgericht Hamburg</option>
            </optgroup>
            <optgroup label="NRW">
              <option value="koeln">Köln – Amtsgericht Köln</option>
              <option value="duesseldorf">Düsseldorf – Amtsgericht Düsseldorf</option>
              <option value="essen">Essen – Amtsgericht Essen</option>
              <option value="dortmund">Dortmund – Amtsgericht Dortmund</option>
              <option value="bonn">Bonn – Amtsgericht Bonn</option>
              <option value="wuppertal">Wuppertal – Amtsgericht Wuppertal</option>
              <option value="bochum">Bochum – Amtsgericht Bochum</option>
            </optgroup>
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={includeTimelineInPack}
            onChange={(e) => setIncludeTimelineInPack(e.target.checked)}
          />
          {t.result.attachTimeline}
        </label>
        <label className="block text-sm">
          Parent A full name
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={form.parentA?.fullName || ""}
            onChange={(e) =>
              setForm({ ...form, parentA: { ...form.parentA, fullName: e.target.value } })
            }
          />
        </label>
        <label className="block text-sm">
          Parent A address
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={form.parentA?.address || ""}
            onChange={(e) =>
              setForm({ ...form, parentA: { ...form.parentA, address: e.target.value } })
            }
          />
        </label>
        <label className="block text-sm">
          Parent B full name
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={form.parentB?.fullName || ""}
            onChange={(e) =>
              setForm({ ...form, parentB: { ...form.parentB, fullName: e.target.value } })
            }
          />
        </label>
      </div>
      <button
        onClick={onDownload}
        disabled={downloading}
        className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800"
      >
        {downloading ? "..." : t.common.download}
      </button>
    </div>
  );
}
