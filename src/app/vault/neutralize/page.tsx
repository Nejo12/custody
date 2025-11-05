"use client";
import { useState } from "react";
import { useI18n } from "@/i18n";
import { useAppStore } from "@/store/app";
import type { NeutralizeResponse } from "@/types/ai";

export default function NeutralizePage() {
  const { locale, t } = useI18n();
  const { addEntry } = useAppStore();
  const [text, setText] = useState("");
  const [tone, setTone] = useState<"neutral" | "polite" | "assertive">("neutral");
  const [out, setOut] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function onRewrite() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/neutralize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, text, tone }),
      });
      const data = (await res.json()) as NeutralizeResponse & { error?: string };
      if (data && typeof data.text === "string") setOut(data.text);
      else alert(data.error || "Rewrite failed");
    } finally {
      setLoading(false);
    }
  }

  function addToVault() {
    if (!out) return;
    addEntry({
      id: crypto.randomUUID(),
      type: "note",
      title: "Letter (neutralized)",
      timestamp: Date.now(),
      payload: { content: out },
    });
    alert("Saved to Vault");
  }

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-semibold">
        {t.neutralizer?.title || "Conflict neutralizer (beta)"}
      </h1>
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          className="rounded border px-2 py-1"
          onClick={() => setText(t.neutralizer?.presetJugendamt || "")}
        >
          {t.neutralizer?.presetJugendamtLabel || "Jugendamt"}
        </button>
        <button
          className="rounded border px-2 py-1"
          onClick={() => setText(t.neutralizer?.presetMediation || "")}
        >
          {t.neutralizer?.presetMediationLabel || "Mediation"}
        </button>
        <button
          className="rounded border px-2 py-1"
          onClick={() => setText(t.neutralizer?.presetCourt || "")}
        >
          {t.neutralizer?.presetCourtLabel || "Court registry"}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
        <label className="text-sm sm:col-span-3">
          {t.neutralizer?.yourDraft || "Your draft"}
          <textarea
            className="mt-1 w-full min-h-32 rounded border p-3"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the message you want to rewrite…"
          />
        </label>
        <label className="text-sm sm:col-span-1">
          {t.neutralizer?.tone || "Tone"}
          <select
            className="mt-1 w-full rounded border px-2 py-2"
            value={tone}
            onChange={(e) => setTone(e.target.value as typeof tone)}
          >
            <option value="neutral">Neutral</option>
            <option value="polite">Polite</option>
            <option value="assertive">Assertive</option>
          </select>
        </label>
      </div>
      <div className="flex gap-2">
        <button onClick={onRewrite} className="rounded border px-3 py-1 text-sm">
          {loading ? t.neutralizer?.rewriting || "Rewriting…" : t.neutralizer?.rewrite || "Rewrite"}
        </button>
        {out && (
          <>
            <button onClick={addToVault} className="rounded border px-3 py-1 text-sm">
              Add to Vault
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(out)}
              className="rounded border px-3 py-1 text-sm"
            >
              Copy
            </button>
          </>
        )}
      </div>
      {out && (
        <div className="rounded-lg border p-3 bg-zinc-50 dark:bg-zinc-900">
          <div className="text-sm font-medium mb-1">
            {t.neutralizer?.rewritten || "Rewritten message"}
          </div>
          <pre className="whitespace-pre-wrap text-sm">{out}</pre>
          <div className="text-[11px] text-zinc-500 mt-2">
            Information only — not individualized legal advice.
          </div>
        </div>
      )}
    </div>
  );
}
