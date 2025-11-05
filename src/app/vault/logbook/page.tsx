"use client";
import { useState } from "react";
import { useAppStore } from "@/store/app";

type Entry = { ts: number; text: string };

export default function LogbookPage() {
  const { addEntry } = useAppStore();
  const [items, setItems] = useState<Entry[]>([]);
  const [text, setText] = useState("");
  function add() {
    const t = text.trim();
    if (!t) return;
    setItems([{ ts: Date.now(), text: t }, ...items]);
    setText("");
  }
  function addProof() {
    setText((v) => (v ? v + "\n" : "") + "[Add proof: screenshot/file link/ID]");
  }
  async function saveToVault() {
    const lines = items
      .slice()
      .reverse()
      .map((i) => `[${new Date(i.ts).toISOString().slice(0, 10)}] ${i.text}`)
      .join("\n");
    addEntry({
      id: crypto.randomUUID(),
      type: "note",
      title: "Timeline",
      timestamp: Date.now(),
      payload: { content: lines },
    });
    alert("Logbook saved to Vault as Timeline.");
  }
  async function exportPdf() {
    const payload = {
      lines: items
        .slice()
        .reverse()
        .map((i) => `[${new Date(i.ts).toISOString().slice(0, 19).replace("T", " ")}] ${i.text}`)
        .join("\n"),
    };
    const res = await fetch("/api/pdf/logbook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logbook-${new Date().toISOString().slice(0, 10)}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-semibold">Logbook generator</h1>
      <div className="rounded border p-3 space-y-2">
        <textarea
          className="w-full rounded border p-2 text-sm min-h-28"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a brief, factual entry…"
        />
        <div className="flex gap-2">
          <button className="rounded border px-3 py-1 text-sm" onClick={add}>
            Add Entry
          </button>
          <button className="rounded border px-3 py-1 text-sm" onClick={addProof}>
            Add proof
          </button>
        </div>
      </div>
      {items.length > 0 && (
        <div className="rounded border p-3">
          <div className="text-sm font-medium mb-2">Entries</div>
          <ul className="text-sm list-disc pl-5 space-y-1 max-h-60 overflow-auto">
            {items.map((i, idx) => (
              <li key={idx}>
                <b>[{new Date(i.ts).toISOString().slice(0, 19).replace("T", " ")}]</b> {i.text}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <button className="rounded border px-3 py-1 text-sm" onClick={saveToVault}>
              Save to Vault
            </button>
            <button className="rounded border px-3 py-1 text-sm" onClick={exportPdf}>
              Download PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
