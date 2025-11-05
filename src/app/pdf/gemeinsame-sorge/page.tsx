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
  const [senderSource, setSenderSource] = useState<"ocr" | "parentA">("ocr");
  const ocrNotes = vault.entries.filter((e) => {
    if (e.type !== "note") return false;
    const f = (e.payload as { fields?: unknown }).fields;
    return typeof f === "object" && f !== null;
  });
  const [selectedOcrId, setSelectedOcrId] = useState<string>(ocrNotes[0]?.id || "");
  function getFields(id: string): { fullName?: string; address?: string } | undefined {
    const e = ocrNotes.find((n) => n.id === id);
    if (!e) return undefined;
    const pf = (e.payload as { fields?: { fullName?: string; address?: string } }).fields;
    return pf;
  }
  function prefill(parent: "A" | "B") {
    const f = getFields(selectedOcrId);
    if (!f) return;
    setForm((prev) => ({
      ...prev,
      parentA:
        parent === "A"
          ? {
              ...prev.parentA,
              fullName: prev.parentA.fullName || f.fullName || "",
              address: prev.parentA.address || f.address || "",
            }
          : prev.parentA,
      parentB:
        parent === "B"
          ? {
              ...prev.parentB,
              fullName: prev.parentB.fullName || f.fullName || "",
              address: prev.parentB.address || f.address || "",
            }
          : prev.parentB,
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

      // Sender from selection (OCR note or Parent A)
      const sender = (() => {
        if (senderSource === "parentA") {
          return { fullName: form.parentA?.fullName, address: form.parentA?.address };
        }
        const e = vault.entries.find((x) => x.id === selectedOcrId);
        if (!e) return undefined;
        const f = (
          e.payload as {
            fields?: {
              fullName?: string;
              address?: string;
              phone?: string;
              email?: string;
              city?: string;
            };
          }
        ).fields;
        return f;
      })();

      // Optional timeline attach from Vault
      let timelineText = "";
      try {
        if (includeTimelineInPack) {
          const entry = vault.entries.find(
            (e) =>
              e.type === "note" &&
              typeof e.payload?.content === "string" &&
              e.title.toLowerCase().includes("timeline")
          );
          if (entry && typeof entry.payload?.content === "string") {
            timelineText = entry.payload.content as string;
          }
        }
      } catch {}

      const res = await fetch("/api/pdf/gemeinsame-sorge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData: {
            ...(form as unknown as Record<string, unknown>),
            courtTemplate,
            sender,
          } as FormData,
          timelineText: timelineText || undefined,
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
      // Mark milestone: PDF generated
      try {
        (await import("@/store/app")).useAppStore.getState().setMilestone("pdfGenerated", true);
      } catch {
        // ignore
      }
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-semibold">{t.result.generateJointCustody}</h1>
      <div className="space-y-2">
        {ocrNotes.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-end gap-2">
            <label className="text-sm flex-1">
              OCR note
              <select
                className="mt-1 w-full rounded border px-3 py-2"
                value={selectedOcrId}
                onChange={(e) => setSelectedOcrId(e.target.value)}
              >
                {ocrNotes.map((n) => (
                  <option
                    key={n.id}
                    value={n.id}
                  >{`${n.title} – ${new Date(n.timestamp).toISOString().slice(0, 10)}`}</option>
                ))}
              </select>
            </label>
            <div className="flex gap-2">
              <button type="button" className="text-sm underline" onClick={() => prefill("A")}>
                Prefill Parent A
              </button>
              <button type="button" className="text-sm underline" onClick={() => prefill("B")}>
                Prefill Parent B
              </button>
              <button
                type="button"
                className="text-sm underline"
                onClick={() =>
                  setForm((prev) => ({ ...prev, parentA: prev.parentB, parentB: prev.parentA }))
                }
              >
                Swap A/B
              </button>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs">
          <span>Sender source</span>
          <select
            value={senderSource}
            onChange={(e) => setSenderSource(e.target.value as typeof senderSource)}
            className="rounded border px-2 py-1"
          >
            <option value="ocr">Selected OCR note</option>
            <option value="parentA">Parent A</option>
          </select>
          {(() => {
            const f =
              senderSource === "parentA"
                ? { fullName: form.parentA?.fullName, address: form.parentA?.address }
                : (
                    vault.entries.find((x) => x.id === selectedOcrId)?.payload as {
                      fields?: {
                        fullName?: string;
                        address?: string;
                        phone?: string;
                        email?: string;
                        city?: string;
                      };
                    }
                  )?.fields || {};
            const deriveCity = (addr?: string, city?: string) => {
              if (city) return city;
              if (!addr) return "";
              const m = addr.match(/\b\d{5}\s+([A-Za-zÄÖÜäöüß\- ]{2,})\b/);
              return m ? m[1].trim() : "";
            };
            const city = deriveCity(
              (f as { address?: string }).address,
              (f as { city?: string }).city
            );
            if ((f as { fullName?: string }).fullName || city) {
              return (
                <span className="text-[11px] text-zinc-600 dark:text-zinc-400">
                  {((f as { fullName?: string }).fullName || "") as string}
                  {(f as { fullName?: string }).fullName && city ? " — " : ""}
                  {city}
                  {(((f as { phone?: string }).phone || (f as { email?: string }).email) && (
                    <>
                      {" · "}
                      {((f as { phone?: string }).phone || "") as string}
                      {(f as { phone?: string }).phone && (f as { email?: string }).email
                        ? " · "
                        : ""}
                      {((f as { email?: string }).email || "") as string}
                    </>
                  )) ||
                    null}
                </span>
              );
            }
            return null;
          })()}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span>Sender source</span>
          <select
            value={senderSource}
            onChange={(e) => setSenderSource(e.target.value as typeof senderSource)}
            className="rounded border px-2 py-1"
          >
            <option value="ocr">Selected OCR note</option>
            <option value="parentA">Parent A</option>
          </select>
        </div>
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
            <optgroup label="Bayern">
              <option value="bayern-muenchen">München – Amtsgericht München</option>
            </optgroup>
            <optgroup label="Baden‑Württemberg">
              <option value="bw-stuttgart">Stuttgart – Amtsgericht Stuttgart</option>
            </optgroup>
            <optgroup label="Hessen">
              <option value="hessen-frankfurt">Frankfurt – Amtsgericht Frankfurt am Main</option>
            </optgroup>
            <optgroup label="Sachsen">
              <option value="sachsen-leipzig">Leipzig – Amtsgericht Leipzig</option>
            </optgroup>
            <optgroup label="Niedersachsen">
              <option value="nds-hannover">Hannover – Amtsgericht Hannover</option>
            </optgroup>
            <optgroup label="Rheinland‑Pfalz">
              <option value="rlp-mainz">Mainz – Amtsgericht Mainz</option>
            </optgroup>
            <optgroup label="Schleswig‑Holstein">
              <option value="sh-kiel">Kiel – Amtsgericht Kiel</option>
            </optgroup>
            <optgroup label="Bremen">
              <option value="bremen">Bremen – Amtsgericht Bremen</option>
            </optgroup>
            <optgroup label="Saarland">
              <option value="saar-saarbruecken">Saarbrücken – Amtsgericht Saarbrücken</option>
            </optgroup>
            <optgroup label="Brandenburg">
              <option value="bb-potsdam">Potsdam – Amtsgericht Potsdam</option>
            </optgroup>
            <optgroup label="Mecklenburg‑Vorpommern">
              <option value="mv-rostock">Rostock – Amtsgericht Rostock</option>
            </optgroup>
            <optgroup label="Thüringen">
              <option value="thueringen-erfurt">Erfurt – Amtsgericht Erfurt</option>
            </optgroup>
            <optgroup label="Sachsen‑Anhalt">
              <option value="st-magdeburg">Magdeburg – Amtsgericht Magdeburg</option>
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
