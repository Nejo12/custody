"use client";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { normalizeSchedule, type ScheduleInput } from "@/lib/schedule";
import type { ScheduleSuggestResponse } from "@/types/ai";
import { useAppStore } from "@/store/app";

type ProposalForm = {
  proposal: ScheduleInput;
};

export default function UmgangPage() {
  const { t, locale } = useI18n();
  const [form, setForm] = useState<ProposalForm>({
    proposal: { weekday: {}, weekend: {}, holidays: {}, handover: {} },
  });
  const [courtTemplate, setCourtTemplate] = useState<string>("");
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
      <div className="rounded-lg border p-3 space-y-2">
        <div className="text-sm font-medium">Schedule optimizer (beta)</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label className="text-sm">
            Distance
            <select
              className="mt-1 w-full rounded border px-2 py-2"
              value={optimizer.distance}
              onChange={(e) =>
                setOptimizer({
                  ...optimizer,
                  distance: e.target.value as typeof optimizer.distance,
                })
              }
            >
              <option value="local">&lt; 30 km</option>
              <option value="regional">30–150 km</option>
              <option value="far">&gt; 150 km</option>
            </select>
          </label>
          <label className="text-sm flex items-end gap-2">
            <input
              type="checkbox"
              checked={optimizer.childUnderThree}
              onChange={(e) => setOptimizer({ ...optimizer, childUnderThree: e.target.checked })}
            />
            Child under 3
          </label>
          <label className="text-sm sm:col-span-2">
            Work hours (free text)
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              value={optimizer.workHours}
              onChange={(e) => setOptimizer({ ...optimizer, workHours: e.target.value })}
              placeholder="e.g. Mon-Fri 9-17"
            />
          </label>
          <label className="text-sm sm:col-span-2">
            Notes
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              value={optimizer.specialNotes}
              onChange={(e) => setOptimizer({ ...optimizer, specialNotes: e.target.value })}
              placeholder="handover, naps, school pickup..."
            />
          </label>
        </div>
        <div className="flex gap-2">
          <button onClick={onSuggest} className="rounded border px-3 py-1 text-sm">
            {optimizer.loading ? "Suggesting…" : "Suggest schedule"}
          </button>
          {!!optimizer.summary && <div className="text-sm text-zinc-600">{optimizer.summary}</div>}
        </div>
      </div>
      <div className="space-y-3">
        <label className="block text-sm">
          Court (template)
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={courtTemplate}
            onChange={(e) => setCourtTemplate(e.target.value)}
          >
            <option value="">Custom or none</option>
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
        className="rounded-lg border px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-200 hover:text-black dark:hover:text-black"
      >
        {downloading ? "..." : t.common.download}
      </button>
    </div>
  );
}
