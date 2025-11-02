"use client";
import { useState } from 'react';
import { useI18n } from '@/i18n';
import { normalizeSchedule, type ScheduleInput } from '@/lib/schedule';

type ProposalForm = {
  proposal: ScheduleInput;
};

export default function UmgangPage() {
  const { t, locale } = useI18n();
  const [form, setForm] = useState<ProposalForm>({ proposal: { weekday: {}, weekend: {}, holidays: {}, handover: {} } });
  const [downloading, setDownloading] = useState(false);

  async function onDownload() {
    setDownloading(true);
    try {
      const normalized = normalizeSchedule(form.proposal || {});
      const res = await fetch('/api/pdf/umgangsregelung', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData: { ...form, proposal: normalized }, citations: [{ label: 'BGB §1684', url: 'https://gesetze-im-internet.de/bgb/__1684.html' }], snapshotIds: [], locale }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `umgangsregelung-${new Date().toISOString().slice(0,10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-semibold">{t.result.generateContactOrder}</h1>
      <div className="space-y-2">
        <label className="block text-sm">Weekday proposal (e.g., Mon 16:00-19:00)
          <input className="mt-1 w-full rounded border px-3 py-2" value={(form.proposal.weekday?.monday)||''} onChange={(e)=>setForm({...form, proposal: { ...form.proposal, weekday: { ...(form.proposal.weekday||{}), monday: e.target.value }}})} />
        </label>
        <label className="block text-sm">Weekend proposal (e.g., even Fri→Sun)
          <input className="mt-1 w-full rounded border px-3 py-2" value={(form.proposal.weekend?.even)||''} onChange={(e)=>setForm({...form, proposal: { ...form.proposal, weekend: { ...(form.proposal.weekend||{}), even: e.target.value }}})} />
        </label>
        <label className="block text-sm">Handover location
          <input className="mt-1 w-full rounded border px-3 py-2" value={form.proposal.handover?.location||''} onChange={(e)=>setForm({...form, proposal: { ...form.proposal, handover: { ...(form.proposal.handover||{}), location: e.target.value }}})} />
        </label>
      </div>
      <div className="text-xs text-zinc-600">
        <div className="font-medium">Preview</div>
        <pre className="whitespace-pre-wrap bg-zinc-50 p-2 rounded border">{JSON.stringify(normalizeSchedule(form.proposal||{}), null, 2)}</pre>
      </div>
      <button onClick={onDownload} disabled={downloading} className="rounded-lg border px-4 py-2 hover:bg-zinc-50">
        {downloading ? '...' : t.common.download}
      </button>
    </div>
  );
}
