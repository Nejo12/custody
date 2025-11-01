"use client";
import { useMemo, useState } from 'react';
import { useAppStore, type Entry } from '@/store/app';
import { useI18n } from '@/i18n';

export default function VaultPage() {
  const { t } = useI18n();
  const { vault, addEntry, removeEntry, exportData } = useAppStore();
  const [tab, setTab] = useState<'documents' | 'notes' | 'payments'>('documents');
  const entries = vault.entries;

  const filtered = useMemo(() => {
    const type = tab === 'documents' ? 'file' : tab === 'notes' ? 'note' : 'payment';
    return entries.filter((e) => e.type === type);
  }, [entries, tab]);

  function addNote() {
    const title = prompt(t.vault.addNote) || '';
    if (!title) return;
    const e: Entry = { id: crypto.randomUUID(), type: 'note', title, timestamp: Date.now(), payload: {} };
    addEntry(e);
  }

  async function addFile(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (!file) return;
    const buf = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
    const e: Entry = { id: crypto.randomUUID(), type: 'file', title: file.name, timestamp: Date.now(), payload: { base64, type: file.type } };
    addEntry(e);
    ev.currentTarget.value = '';
  }

  function downloadExport() {
    const blob = new Blob([exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `custody-clarity-export-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-semibold">{t.vault.title}</h1>
      <div className="flex gap-2 text-sm">
        <button onClick={() => setTab('documents')} className={`px-3 py-1 rounded-full border ${tab==='documents'?'bg-black text-white':'bg-white'}`}>{t.vault.documents}</button>
        <button onClick={() => setTab('notes')} className={`px-3 py-1 rounded-full border ${tab==='notes'?'bg-black text-white':'bg-white'}`}>{t.vault.notes}</button>
        <button onClick={() => setTab('payments')} className={`px-3 py-1 rounded-full border ${tab==='payments'?'bg-black text-white':'bg-white'}`}>{t.vault.payments}</button>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={addNote} className="underline text-sm">{t.vault.addNote}</button>
        <label className="underline text-sm cursor-pointer">
          {t.vault.addFile}
          <input type="file" className="hidden" onChange={addFile} />
        </label>
        <button onClick={downloadExport} className="underline text-sm">{t.vault.exportData}</button>
      </div>

      <div className="space-y-3">
        {filtered.map((e) => (
          <div key={e.id} className="rounded-lg border p-4">
            <div className="text-xs text-zinc-500">{new Date(e.timestamp).toLocaleString()}</div>
            <div className="font-medium">{e.title}</div>
            {e.type === 'file' && typeof e.payload?.type === 'string' && (
              <div className="text-xs text-zinc-500">{e.payload.type}</div>
            )}
            <button onClick={() => removeEntry(e.id)} className="mt-2 text-xs underline">Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}

