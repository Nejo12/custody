"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n";
import { normalizeSchedule, type ScheduleInput } from "@/lib/schedule";
import type { ScheduleSuggestResponse } from "@/types/ai";
import { useAppStore } from "@/store/app";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { resolveCourtTemplate } from "@/lib/courts";

type ProposalForm = {
  proposal: ScheduleInput;
  applicant?: { fullName?: string; address?: string };
  otherParent?: { fullName?: string; address?: string };
};

export default function UmgangPage() {
  const { t, locale } = useI18n();
  const prefersReduced = usePrefersReducedMotion();
  const [form, setForm] = useState<ProposalForm>({
    proposal: { weekday: {}, weekend: {}, holidays: {}, handover: {} },
  });
  const [courtTemplate, setCourtTemplate] = useState<string>("");
  const {
    setPreferredCourtTemplate,
    includeTimelineInPack,
    setIncludeTimelineInPack,
    preferredCity,
    preferredCourtTemplate,
    vault,
  } = useAppStore();
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
  function prefillApplicant() {
    const f = getFields(selectedOcrId);
    if (!f) return;
    setForm((prev) => ({
      ...prev,
      applicant: {
        fullName: prev.applicant?.fullName || f.fullName,
        address: prev.applicant?.address || f.address,
      },
    }));
  }
  const [downloading, setDownloading] = useState(false);
  const [optimizer, setOptimizer] = useState({
    distance: "local" as "local" | "regional" | "far",
    childUnderThree: false,
    workHours: "",
    specialNotes: "",
    loading: false,
    summary: "",
  });

  // Seed optimizer from interview answers if present
  const { interview } = useAppStore();
  useEffect(() => {
    const ans = interview?.answers || {};
    const mapDistance = (v: string | undefined): "local" | "regional" | "far" =>
      v === "regional" || v === "far" ? (v as "regional" | "far") : "local";
    setOptimizer((o) => ({
      ...o,
      distance: mapDistance(ans["distance_km"] as string | undefined),
      childUnderThree: ans["child_age_under_three"] === "yes",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onDownload() {
    setDownloading(true);
    try {
      const normalized = normalizeSchedule(form.proposal || {});
      const res = await fetch("/api/pdf/umgangsregelung", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData: { ...form, proposal: normalized, courtTemplate },
          citations: [
            { label: "BGB §1684", url: "https://gesetze-im-internet.de/bgb/__1684.html" },
          ],
          snapshotIds: [],
          locale,
        }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `umgangsregelung-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  async function onSuggest() {
    setOptimizer((o) => ({ ...o, loading: true, summary: "" }));
    try {
      const res = await fetch("/api/ai/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          distance: optimizer.distance,
          childUnderThree: optimizer.childUnderThree,
          workHours: optimizer.workHours,
          specialNotes: optimizer.specialNotes,
          city: preferredCity,
          courtName: resolveCourtTemplate(preferredCourtTemplate || courtTemplate).name || "",
        }),
      });
      const data = (await res.json()) as ScheduleSuggestResponse;
      const next = normalizeSchedule({
        weekday: data.weekday,
        weekend: data.weekend,
        handover: data.handover,
      });
      setForm({ ...form, proposal: next });
      setOptimizer((o) => ({ ...o, loading: false, summary: data.summary || "" }));
    } catch {
      setOptimizer((o) => ({ ...o, loading: false }));
      alert("Optimizer unavailable.");
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-semibold">{t.result.generateContactOrder}</h1>
      {ocrNotes.length > 0 && (
        <div className="rounded-lg border p-3 space-y-2">
          <div className="text-sm font-medium">Prefill suggestions (OCR)</div>
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
                  >{`${n.title} – ${new Date(n.timestamp).toLocaleDateString()}`}</option>
                ))}
              </select>
            </label>
            <div className="flex gap-2">
              <button type="button" className="text-sm underline" onClick={prefillApplicant}>
                Prefill applicant
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <label className="block text-sm">
              Applicant full name (optional)
              <input
                className="mt-1 w-full rounded border px-2 py-2"
                value={form.applicant?.fullName || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    applicant: { ...(form.applicant || {}), fullName: e.target.value },
                  })
                }
              />
            </label>
            <label className="block text-sm">
              Applicant address (optional)
              <input
                className="mt-1 w-full rounded border px-2 py-2"
                value={form.applicant?.address || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    applicant: { ...(form.applicant || {}), address: e.target.value },
                  })
                }
              />
            </label>
            <label className="block text-sm">
              Other parent full name (optional)
              <input
                className="mt-1 w-full rounded border px-2 py-2"
                value={form.otherParent?.fullName || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    otherParent: { ...(form.otherParent || {}), fullName: e.target.value },
                  })
                }
              />
            </label>
            <label className="block text-sm">
              Other parent address (optional)
              <input
                className="mt-1 w-full rounded border px-2 py-2"
                value={form.otherParent?.address || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    otherParent: { ...(form.otherParent || {}), address: e.target.value },
                  })
                }
              />
            </label>
            <div className="sm:col-span-2">
              <button
                type="button"
                className="text-xs underline"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    applicant: prev.otherParent,
                    otherParent: prev.applicant,
                  }))
                }
              >
                Swap applicant/other parent
              </button>
            </div>
          </div>
        </div>
      )}
      <motion.div
        className="rounded-lg border p-3 space-y-2"
        initial={{ opacity: prefersReduced ? 1 : 0, y: prefersReduced ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReduced ? 0 : 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="text-sm font-medium">
          {t.optimizer?.title || "Schedule optimizer (beta)"}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label className="text-sm">
            {t.optimizer?.distance || "Distance"}
            <select
              className="mt-1 w-full rounded border px-2 py-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              value={optimizer.distance}
              onChange={(e) =>
                setOptimizer({
                  ...optimizer,
                  distance: e.target.value as typeof optimizer.distance,
                })
              }
            >
              <option value="local">{t.optimizer?.distanceLocal || "< 30 km"}</option>
              <option value="regional">{t.optimizer?.distanceRegional || "30–150 km"}</option>
              <option value="far">{t.optimizer?.distanceFar || "> 150 km"}</option>
            </select>
          </label>
          <label className="text-sm flex items-end gap-2">
            <input
              type="checkbox"
              checked={optimizer.childUnderThree}
              onChange={(e) => setOptimizer({ ...optimizer, childUnderThree: e.target.checked })}
            />
            {t.optimizer?.childUnderThree || "Child under 3"}
          </label>
          <label className="text-sm sm:col-span-2">
            {t.optimizer?.workHours || "Work hours (free text)"}
            <input
              className="mt-1 w-full rounded border px-3 py-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400"
              value={optimizer.workHours}
              onChange={(e) => setOptimizer({ ...optimizer, workHours: e.target.value })}
              placeholder={t.optimizer?.workHoursPlaceholder || "e.g. Mon-Fri 9-17"}
            />
          </label>
          <label className="text-sm sm:col-span-2">
            {t.optimizer?.notes || "Notes"}
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              value={optimizer.specialNotes}
              onChange={(e) => setOptimizer({ ...optimizer, specialNotes: e.target.value })}
              placeholder={t.optimizer?.notesPlaceholder || "handover, naps, school pickup..."}
            />
          </label>
        </div>
        <div className="flex gap-2">
          <button onClick={onSuggest} className="rounded border px-3 py-1 text-sm">
            {optimizer.loading
              ? t.optimizer?.suggesting || "Suggesting…"
              : t.optimizer?.suggest || "Suggest schedule"}
          </button>
          {!!optimizer.summary && (
            <motion.div
              className="text-sm text-zinc-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {optimizer.summary}
            </motion.div>
          )}
        </div>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={useAppStore.getState().includeTimelineInPack}
            onChange={(e) => useAppStore.getState().setIncludeTimelineInPack(e.target.checked)}
          />
          {t.result.attachTimeline}
        </label>
      </motion.div>
      {/* Optimizer explainer + citations */}
      {optimizer.summary && (
        <div className="rounded-lg border p-3 space-y-2">
          <div className="text-sm font-medium">
            {t.optimizer?.explainerTitle || "Why this plan"}
          </div>
          <div className="text-sm text-zinc-700 dark:text-zinc-300">{optimizer.summary}</div>
          <div className="text-xs text-zinc-700 dark:text-zinc-400">
            {t.optimizer?.explainerNote || "Based on distance, age, and notes."}
          </div>
          <div className="text-xs mt-1">
            <div className="font-medium">{t.optimizer?.citations || "Citations"}</div>
            <ul className="list-disc pl-4">
              <li>
                <a
                  className="underline"
                  href="https://gesetze-im-internet.de/bgb/__1684.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  BGB §1684
                </a>
              </li>
            </ul>
          </div>
        </div>
      )}
      <label className="block text-xs mt-2 flex items-center gap-2">
        <input
          type="checkbox"
          checked={includeTimelineInPack}
          onChange={(e) => setIncludeTimelineInPack(e.target.checked)}
        />
        {t.result.attachTimeline}
      </label>
      <div className="space-y-3">
        <label className="block text-sm">
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
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-sm">
            Mon
            <input
              className="mt-1 w-full rounded border px-2 py-2"
              value={form.proposal.weekday?.monday || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  proposal: {
                    ...form.proposal,
                    weekday: { ...(form.proposal.weekday || {}), monday: e.target.value },
                  },
                })
              }
            />
          </label>
          <label className="block text-sm">
            Tue
            <input
              className="mt-1 w-full rounded border px-2 py-2"
              value={form.proposal.weekday?.tuesday || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  proposal: {
                    ...form.proposal,
                    weekday: { ...(form.proposal.weekday || {}), tuesday: e.target.value },
                  },
                })
              }
            />
          </label>
          <label className="block text-sm">
            Wed
            <input
              className="mt-1 w-full rounded border px-2 py-2"
              value={form.proposal.weekday?.wednesday || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  proposal: {
                    ...form.proposal,
                    weekday: { ...(form.proposal.weekday || {}), wednesday: e.target.value },
                  },
                })
              }
            />
          </label>
          <label className="block text-sm">
            Thu
            <input
              className="mt-1 w-full rounded border px-2 py-2"
              value={form.proposal.weekday?.thursday || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  proposal: {
                    ...form.proposal,
                    weekday: { ...(form.proposal.weekday || {}), thursday: e.target.value },
                  },
                })
              }
            />
          </label>
          <label className="block text-sm">
            Fri
            <input
              className="mt-1 w-full rounded border px-2 py-2"
              value={form.proposal.weekday?.friday || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  proposal: {
                    ...form.proposal,
                    weekday: { ...(form.proposal.weekday || {}), friday: e.target.value },
                  },
                })
              }
            />
          </label>
          <label className="block text-sm">
            Sat
            <input
              className="mt-1 w-full rounded border px-2 py-2"
              value={form.proposal.weekday?.saturday || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  proposal: {
                    ...form.proposal,
                    weekday: { ...(form.proposal.weekday || {}), saturday: e.target.value },
                  },
                })
              }
            />
          </label>
          <label className="block text-sm">
            Sun
            <input
              className="mt-1 w-full rounded border px-2 py-2"
              value={form.proposal.weekday?.sunday || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  proposal: {
                    ...form.proposal,
                    weekday: { ...(form.proposal.weekday || {}), sunday: e.target.value },
                  },
                })
              }
            />
          </label>
        </div>
        <label className="block text-sm">
          Weekend even
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={form.proposal.weekend?.even || ""}
            onChange={(e) =>
              setForm({
                ...form,
                proposal: {
                  ...form.proposal,
                  weekend: { ...(form.proposal.weekend || {}), even: e.target.value },
                },
              })
            }
          />
        </label>
        <label className="block text-sm">
          Weekend odd
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={form.proposal.weekend?.odd || ""}
            onChange={(e) =>
              setForm({
                ...form,
                proposal: {
                  ...form.proposal,
                  weekend: { ...(form.proposal.weekend || {}), odd: e.target.value },
                },
              })
            }
          />
        </label>
        <label className="block text-sm">
          Handover location
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={form.proposal.handover?.location || ""}
            onChange={(e) =>
              setForm({
                ...form,
                proposal: {
                  ...form.proposal,
                  handover: { ...(form.proposal.handover || {}), location: e.target.value },
                },
              })
            }
          />
        </label>
      </div>
      <div className="text-xs text-zinc-600">
        <div className="font-medium">Preview</div>
        <pre className="whitespace-pre-wrap bg-zinc-50 p-2 rounded border">
          {JSON.stringify(normalizeSchedule(form.proposal || {}), null, 2)}
        </pre>
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
