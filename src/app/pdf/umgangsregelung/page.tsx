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
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-sm">Mon
            <input className="mt-1 w-full rounded border px-2 py-2" value={form.proposal.weekday?.monday||''} onChange={(e)=>setForm({...form, proposal: { ...form.proposal, weekday: { ...(form.proposal.weekday||{}), monday: e.target.value }}})} />
          </label>
          <label className="block text-sm">Tue
            <input className="mt-1 w-full rounded border px-2 py-2" value={form.proposal.weekday?.tuesday||''} onChange={(e)=>setForm({...form, proposal: { ...form.proposal, weekday: { ...(form.proposal.weekday||{}), tuesday: e.target.value }}})} />
          </label>
          <label className="block text-sm">Wed
            <input className="mt-1 w-full rounded border px-2 py-2" value={form.proposal.weekday?.wednesday||''} onChange={(e)=>setForm({...form, proposal: { ...form.proposal, weekday: { ...(form.proposal.weekday||{}), wednesday: e.target.value }}})} />
          </label>
          <label className="block text-sm">Thu
            <input className="mt-1 w-full rounded border px-2 py-2" value={form.proposal.weekday?.thursday||''} onChange={(e)=>setForm({...form, proposal: { ...form.proposal, weekday: { ...(form.proposal.weekday||{}), thursday: e.target.value }}})} />
          </label>
          <label className="block text-sm">Fri
            <input className="mt-1 w-full rounded border px-2 py-2" value={form.proposal.weekday?.friday||''} onChange={(e)=>setForm({...form, proposal: { ...form.proposal, weekday: { ...(form.proposal.weekday||{}), friday: e.target.value }}})} />
          </label>
          <label className="block text-sm">Sat
            <input className="mt-1 w-full rounded border px-2 py-2" value={form.proposal.weekday?.saturday||''} onChange={(e)=>setForm({...form, proposal: { ...form.proposal, weekday: { ...(form.proposal.weekday||{}), saturday: e.target.value }}})} />
          </label>
          <label className="block text-sm">Sun
            <input className="mt-1 w-full rounded border px-2 py-2" value={form.proposal.weekday?.sunday||''} onChange={(e)=>setForm({...form, proposal: { ...form.proposal, weekday: { ...(form.proposal.weekday||{}), sunday: e.target.value }}})} />
          </label>
        </div>
        <label className="block text-sm">Weekend even
          <input className="mt-1 w-full rounded border px-3 py-2" value={form.proposal.weekend?.even||''} onChange={(e)=>setForm({...form, proposal: { ...form.proposal, weekend: { ...(form.proposal.weekend||{}), even: e.target.value }}})} />
        </label>
        <label className="block text-sm">Weekend odd
          <input className="mt-1 w-full rounded border px-3 py-2" value={form.proposal.weekend?.odd||''} onChange={(e)=>setForm({...form, proposal: { ...form.proposal, weekend: { ...(form.proposal.weekend||{}), odd: e.target.value }}})} />
        </label>
        <label className="block text-sm">Handover location
          <input className="mt-1 w-full rounded border px-3 py-2" value={form.proposal.handover?.location||''} onChange={(e)=>setForm({...form, proposal: { ...form.proposal, handover: { ...(form.proposal.handover||{}), location: e.target.value }}})} />
        </label>
      </div>
      <div className="text-xs text-zinc-600">
        <div className="font-medium">Preview</div>
        <pre className="whitespace-pre-wrap bg-zinc-50 p-2 rounded border">{JSON.stringify(normalizeSchedule(form.proposal||{}), null, 2)}</pre>
      </div>
      <button onClick={onDownload} disabled={downloading} className="rounded-lg border px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-200 hover:text-black dark:hover:text-black">
        {downloading ? '...' : t.common.download}
      </button>
    </div>
  );
}
