"use client";
import { useState } from 'react';
import { useI18n } from '@/i18n';
import rules from '@/data/rules.json';
import type { SimpleRule, Citation } from '@/lib/rules';
import type { FormData } from '@/types';

type FormState = {
  parentA: { fullName?: string; address?: string };
  parentB: { fullName?: string; address?: string };
  children: unknown[];
};

export default function GSPage() {
  const { t, locale } = useI18n();
  const [form, setForm] = useState<FormState>({ parentA: {}, parentB: {}, children: [] });
  const [downloading, setDownloading] = useState(false);

  async function onDownload() {
    setDownloading(true);
    try {
      const rulesArray = rules as SimpleRule[];
      const citations: Citation[] = rulesArray[1]?.outcome?.citations?.filter((c): c is Citation => 
        typeof c === 'object' && c !== null && 'url' in c
      ) || [];
      const snapshotIds: string[] = (rulesArray[3]?.outcome?.citations || [])
        .filter((c): c is Citation => typeof c === 'object' && c !== null && 'url' in c)
        .map((c: Citation) => c.snapshotId)
        .filter((id): id is string => typeof id === 'string');
      
      const res = await fetch('/api/pdf/gemeinsame-sorge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData: form as FormData, citations, snapshotIds, locale }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gemeinsame-sorge-${new Date().toISOString().slice(0,10)}.pdf`;
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
        <label className="block text-sm">Parent A full name<input className="mt-1 w-full rounded border px-3 py-2" value={form.parentA?.fullName||''} onChange={(e)=>setForm({...form, parentA: {...form.parentA, fullName: e.target.value}})} /></label>
        <label className="block text-sm">Parent A address<input className="mt-1 w-full rounded border px-3 py-2" value={form.parentA?.address||''} onChange={(e)=>setForm({...form, parentA: {...form.parentA, address: e.target.value}})} /></label>
        <label className="block text-sm">Parent B full name<input className="mt-1 w-full rounded border px-3 py-2" value={form.parentB?.fullName||''} onChange={(e)=>setForm({...form, parentB: {...form.parentB, fullName: e.target.value}})} /></label>
      </div>
      <button onClick={onDownload} disabled={downloading} className="rounded-lg border px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-200 hover:text-black dark:hover:text-black">
        {downloading ? '...' : t.common.download}
      </button>
    </div>
  );
}
