"use client";
import { useState } from "react";
import { useI18n } from "@/i18n";
import { useAppStore } from "@/store/app";
import type { SummarizeResponse } from "@/types/ai";

export default function SummarizePage() {
  const { locale } = useI18n();
  const { addEntry } = useAppStore();
  const [text, setText] = useState("");
  const [result, setResult] = useState<SummarizeResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSummarize() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, text }),
      });
      const data = (await res.json()) as SummarizeResponse;
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  function addToVault() {
    if (!result) return;
    const content = result.items.map((i) => `${i.date ? `[${i.date}] ` : ""}${i.text}`).join("\n");
    addEntry({
      id: crypto.randomUUID(),
      type: "note",
      title: "Timeline",
      timestamp: Date.now(),
      payload: { content },
    });
    alert("Timeline saved to Vault.");
  }

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-semibold">Evidence summarizer (beta)</h1>
      <textarea
        className="w-full min-h-40 rounded border p-3"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste chats/notes here…"
      />
      <div className="flex gap-2">
        <button onClick={onSummarize} className="rounded border px-3 py-1 text-sm">
          {loading ? "Summarizing…" : "Summarize"}
        </button>
        {result && (
          <>
            <button onClick={addToVault} className="rounded border px-3 py-1 text-sm">
              Add to Vault
            </button>
            <a
              className="rounded border px-3 py-1 text-sm"
              href={URL.createObjectURL(
                new Blob(
                  [result.items.map((i) => `${i.date ? `[${i.date}] ` : ""}${i.text}`).join("\n")],
                  { type: "text/plain" }
                )
              )}
              download={`timeline-${new Date().toISOString().slice(0, 10)}.txt`}
            >
              Download .txt
            </a>
          </>
        )}
      </div>
      {result && (
        <div className="rounded-lg border p-3 bg-zinc-50 dark:bg-zinc-900">
          <div className="text-sm font-medium mb-2">Facts-only timeline</div>
          <ul className="text-sm list-disc pl-5 space-y-1">
            {result.items.map((i, idx) => (
              <li key={idx}>
                {i.date ? <b>[{i.date}] </b> : null}
                {i.text}
              </li>
            ))}
          </ul>
          {result.notes && <div className="text-xs text-zinc-500 mt-2">{result.notes}</div>}
          <div className="text-[11px] text-zinc-500 mt-2">
            Information only — not individualized legal advice.
          </div>
        </div>
      )}
    </div>
  );
}
