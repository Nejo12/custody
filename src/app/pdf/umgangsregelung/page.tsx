"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n";
import { normalizeSchedule, type ScheduleInput } from "@/lib/schedule";
import type { ScheduleSuggestResponse } from "@/types/ai";
import { useAppStore } from "@/store/app";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { resolveCourtTemplate } from "@/lib/courts";
import { regionCitations, type RegionKey } from "@/data/region.resources";

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
  const ocrNotes = useMemo(
    () =>
      vault.entries.filter((e) => {
        if (e.type !== "note") return false;
        const f = (e.payload as { fields?: unknown }).fields;
        return typeof f === "object" && f !== null;
      }),
    [vault.entries]
  );
  const [selectedOcrId, setSelectedOcrId] = useState<string>("");

  // Initialize selectedOcrId when ocrNotes change
  useEffect(() => {
    if (ocrNotes.length > 0 && !selectedOcrId) {
      setSelectedOcrId(ocrNotes[0]?.id || "");
    }
  }, [ocrNotes, selectedOcrId]);
  const getFields = useCallback(
    (id: string): { fullName?: string; address?: string } | undefined => {
      const e = ocrNotes.find((n) => n.id === id);
      if (!e) return undefined;
      const pf = (e.payload as { fields?: { fullName?: string; address?: string } }).fields;
      return pf;
    },
    [ocrNotes]
  );
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
  const [senderSource, setSenderSource] = useState<"applicant" | "ocr">("applicant");
  const [optimizer, setOptimizer] = useState({
    distance: "local" as "local" | "regional" | "far",
    childUnderThree: false,
    workHours: "",
    specialNotes: "",
    loading: false,
    summary: "",
  });

  // Build citations for optimizer explainer based on presets + region
  const buildOptimizerCitations = (
    distance: "local" | "regional" | "far",
    under3: boolean,
    region?: RegionKey
  ): { label: string; url: string }[] => {
    const base: { label: string; url: string }[] = [
      { label: "BGB §1684", url: "https://gesetze-im-internet.de/bgb/__1684.html" },
      { label: "BGB §1697a", url: "https://gesetze-im-internet.de/bgb/__1697a.html" },
    ];
    const out = [...base];
    if (under3) {
      out.push({
        label: "Familienportal – Umgang und Kindeswohl",
        url: "https://www.familienportal.de/",
      });
    }
    if (distance === "far") {
      out.push({
        label: "Praxis: Wochenend-/Ferienlösungen bei Entfernung",
        url: "https://www.familienportal.de/",
      });
    }
    if (region && regionCitations[region]) {
      out.push(...regionCitations[region]);
    }
    return out;
  };

  // Region-aware presets for schedule fields
  type CityKey =
    | "berlin"
    | "hamburg"
    | "nrw"
    | "bayern"
    | "bw"
    | "hessen"
    | "sachsen"
    | "niedersachsen"
    | "rlp"
    | "sh"
    | "bremen"
    | "saarland"
    | "brandenburg"
    | "mv"
    | "thueringen";
  const deduceCityFromTemplate = (tpl?: string): CityKey | undefined => {
    if (!tpl) return undefined;
    if (tpl.startsWith("berlin-")) return "berlin";
    if (tpl === "hamburg") return "hamburg";
    if (tpl.startsWith("bayern-")) return "bayern";
    if (tpl.startsWith("bw-")) return "bw";
    if (tpl.startsWith("hessen-")) return "hessen";
    if (tpl.startsWith("sachsen-")) return "sachsen";
    if (tpl.startsWith("nds-")) return "niedersachsen";
    if (tpl.startsWith("rlp-")) return "rlp";
    if (tpl.startsWith("sh-")) return "sh";
    if (tpl === "bremen") return "bremen";
    if (tpl.startsWith("saar-")) return "saarland";
    if (tpl.startsWith("bb-")) return "brandenburg";
    if (tpl.startsWith("mv-")) return "mv";
    if (tpl.startsWith("thueringen-")) return "thueringen";
    // All others default
    return "nrw";
  };
  const currentCity: CityKey | undefined =
    deduceCityFromTemplate(preferredCourtTemplate || courtTemplate) || preferredCity;

  const getRegionTimes = (region: CityKey | undefined) => {
    if (region === "berlin")
      return { short: "16:30–18:30", mid: "15:30–19:00", sat: "10:00–14:00" };
    if (region === "hamburg")
      return { short: "17:00–19:00", mid: "16:00–19:30", sat: "10:00–14:00" };
    if (region === "bayern")
      return { short: "16:00–18:00", mid: "15:00–19:00", sat: "09:30–13:30" };
    if (region === "hessen")
      return { short: "16:30–18:00", mid: "15:30–19:00", sat: "10:00–14:00" };
    // nrw / default
    return { short: "16:30–18:30", mid: "15:00–19:00", sat: "10:00–14:00" };
  };

  const computeRegionPresets = (
    region: CityKey | undefined,
    distance: "local" | "regional" | "far",
    under3: boolean
  ): ScheduleInput => {
    const times = getRegionTimes(region);
    if (distance === "far") {
      return {
        weekday: {},
        weekend: {
          even: "Fri 18:00–Sun 18:00 (every 2nd weekend)",
          odd: "—",
        },
        holidays: {
          summer: "Weeks alternate",
          winter: "Weeks alternate",
        },
        handover: { location: "Neutral meeting point (agreed)" },
      };
    }
    if (distance === "regional") {
      return {
        weekday: under3
          ? { tuesday: times.short, thursday: times.short }
          : { wednesday: times.mid },
        weekend: under3
          ? { even: `Sat ${times.sat}`, odd: "Sun 10:00–14:00" }
          : { even: "Sat 10:00–Sun 18:00", odd: "—" },
        holidays: {},
        handover: {
          location: region ? `${region.toUpperCase()} central station` : "Handover point",
        },
      };
    }
    // local
    return {
      weekday: under3 ? { tuesday: times.short, thursday: times.short } : { wednesday: times.mid },
      weekend: under3
        ? { even: `Sat ${times.sat}`, odd: "Sun 10:00–14:00" }
        : { even: "Sat 10:00–Sun 18:00", odd: "—" },
      holidays: {},
      handover: { location: region ? `${region.toUpperCase()} Jugendamt area` : "Handover point" },
    };
  };

  // Seed or merge presets when location or optimizer inputs change; do not override filled fields
  useEffect(() => {
    const preset = computeRegionPresets(currentCity, optimizer.distance, optimizer.childUnderThree);
    setForm((prev) => {
      const merged: ScheduleInput = {
        weekday: { ...(prev.proposal.weekday || {}) },
        weekend: { ...(prev.proposal.weekend || {}) },
        holidays: { ...(prev.proposal.holidays || {}) },
        handover: { ...(prev.proposal.handover || {}) },
      };
      // Helper to set if empty
      const setIfEmpty = (obj: Record<string, unknown>, key: string, val?: string) => {
        if (!val) return;
        const cur = (obj as Record<string, string | undefined>)[key];
        if (!cur || String(cur).trim() === "") {
          (obj as Record<string, string>)[key] = val;
        }
      };
      // Weekday keys
      Object.entries(preset.weekday || {}).forEach(([k, v]) =>
        setIfEmpty(merged.weekday || {}, k, v as string)
      );
      // Weekend
      if (preset.weekend) {
        setIfEmpty(merged.weekend || {}, "even", preset.weekend.even as string | undefined);
        setIfEmpty(merged.weekend || {}, "odd", preset.weekend.odd as string | undefined);
      }
      // Handover
      if (preset.handover?.location) {
        setIfEmpty(merged.handover || {}, "location", preset.handover.location);
      }
      return { ...prev, proposal: { ...prev.proposal, ...merged } } as ProposalForm;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCity, optimizer.distance, optimizer.childUnderThree]);

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
      const sender =
        senderSource === "ocr" ? getFields(selectedOcrId) || undefined : form.applicant;
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
      } catch {
        // ignore
      }
      const res = await fetch("/api/pdf/umgangsregelung", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData: {
            ...form,
            proposal: normalized,
            courtTemplate,
            sender,
          },
          timelineText: timelineText || undefined,
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
      try {
        (await import("@/store/app")).useAppStore.getState().setMilestone("pdfGenerated", true);
      } catch {
        // ignore
      }
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
      alert(t.pdf?.optimizerUnavailable || "Optimizer unavailable.");
    }
  }

  const senderPreview = useMemo(() => {
    const f = senderSource === "applicant" ? form.applicant || {} : getFields(selectedOcrId) || {};
    const deriveCity = (addr?: string) => {
      if (!addr) return "";
      const m = addr.match(/\b\d{5}\s+([A-Za-zÄÖÜäöüß\- ]{2,})\b/);
      return m ? m[1].trim() : "";
    };
    const city = deriveCity((f as { address?: string }).address);
    if ((f as { fullName?: string }).fullName || city) {
      return (
        <span className="text-[11px] text-zinc-600 dark:text-zinc-400">
          {((f as { fullName?: string }).fullName || "") as string}
          {(f as { fullName?: string }).fullName && city ? " — " : ""}
          {city}
        </span>
      );
    }
    return null;
  }, [senderSource, form.applicant, selectedOcrId, getFields]);

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-semibold">{t.result.generateContactOrder}</h1>
      {ocrNotes.length > 0 && (
        <div className="rounded-lg border p-3 space-y-2">
          <div className="text-sm font-medium">{t.pdfForm.prefillSuggestions}</div>
          <div className="flex flex-col sm:flex-row sm:items-end gap-2">
            <label className="text-sm flex-1">
              {t.pdfForm.ocrNote}
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
              <button type="button" className="text-sm underline" onClick={prefillApplicant}>
                {t.pdfForm.prefillApplicant}
              </button>
              <button
                type="button"
                className="text-sm underline"
                onClick={() => {
                  const f = getFields(selectedOcrId);
                  if (!f) return;
                  setForm((prev) => ({
                    ...prev,
                    otherParent: {
                      fullName: prev.otherParent?.fullName || f.fullName,
                      address: prev.otherParent?.address || f.address,
                    },
                  }));
                }}
              >
                {t.pdfForm.prefillOtherParent}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="sm:col-span-2 flex items-center gap-2 text-xs">
              <span>{t.pdfForm.senderSource}</span>
              <select
                value={senderSource}
                onChange={(e) => setSenderSource(e.target.value as typeof senderSource)}
                className="rounded border px-2 py-1"
              >
                <option value="applicant">{t.pdfForm.applicant}</option>
                <option value="ocr">{t.pdfForm.selectedOcrNote}</option>
              </select>
              {senderPreview}
            </div>
            <label className="block text-sm">
              {t.pdfForm.applicantFullName}
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
              {t.pdfForm.applicantAddress}
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
              {t.pdfForm.otherParentFullName}
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
              {t.pdfForm.otherParentAddress}
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
                {t.pdfForm.swapApplicantOtherParent}
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
          <button
            type="button"
            className="rounded border px-3 py-1 text-sm text-zinc-600 dark:text-zinc-300"
            onClick={() => {
              const preset = computeRegionPresets(
                currentCity,
                optimizer.distance,
                optimizer.childUnderThree
              );
              setForm((prev) => ({ ...prev, proposal: preset }));
            }}
          >
            {t.optimizer?.resetPresets || "Reset to presets"}
          </button>
          <button
            type="button"
            className="rounded border px-3 py-1 text-sm"
            onClick={() => {
              const preset = computeRegionPresets(
                currentCity,
                optimizer.distance,
                optimizer.childUnderThree
              );
              setForm((prev) => ({
                ...prev,
                proposal: {
                  weekday: { ...(prev.proposal.weekday || {}), ...(preset.weekday || {}) },
                  weekend: { ...(prev.proposal.weekend || {}), ...(preset.weekend || {}) },
                  holidays: { ...(prev.proposal.holidays || {}), ...(preset.holidays || {}) },
                  handover: { ...(prev.proposal.handover || {}), ...(preset.handover || {}) },
                },
              }));
            }}
          >
            {t.optimizer?.applyPresets || "Apply region presets"}
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
              {buildOptimizerCitations(
                optimizer.distance,
                optimizer.childUnderThree,
                currentCity as RegionKey | undefined
              ).map((c, i) => (
                <li key={i}>
                  <a className="underline" href={c.url} target="_blank" rel="noopener noreferrer">
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
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
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-sm">
            {t.pdfForm.monday}
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
            {t.pdfForm.tuesday}
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
            {t.pdfForm.wednesday}
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
            {t.pdfForm.thursday}
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
            {t.pdfForm.friday}
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
            {t.pdfForm.saturday}
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
            {t.pdfForm.sunday}
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
          {t.pdfForm.weekendEven}
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
          {t.pdfForm.weekendOdd}
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
          {t.pdfForm.handoverLocation}
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
        <div className="font-medium">{t.pdfForm.preview}</div>
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
