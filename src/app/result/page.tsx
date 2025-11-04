"use client";
import rules from '@/data/rules.json';
import eduEN from '@/data/education.en.json';
import eduDE from '@/data/education.de.json';
import eduFR from '@/data/education.fr.json';
import eduAR from '@/data/education.ar.json';
import eduPL from '@/data/education.pl.json';
import eduRU from '@/data/education.ru.json';
import eduTR from '@/data/education.tr.json';
import { evaluateRules } from '@/lib/rules';
import { useAppStore } from '@/store/app';
import { useI18n } from '@/i18n';
import Link from 'next/link';
import type { SimpleRule, Citation } from '@/lib/rules';
import StatusCard from '@/components/StatusCard';
import type { TranslationDict } from '@/types';
import { motion } from 'framer-motion';
import EducationPanel, { type EducationItem } from '@/components/EducationPanel';
import { buildICS } from '@/lib/ics';
import { useEffect, useMemo, useState } from 'react';

type StatusKey = keyof TranslationDict['result']['statuses'];

export default function Result() {
  const { interview } = useAppStore();
  const { t, locale } = useI18n();
  const { matched, primary, confidence } = evaluateRules(rules as SimpleRule[], interview.answers);

  const status = (primary?.outcome.status || 'unknown') as StatusKey;
  const citations = (primary?.outcome.citations || []) as (Citation | string)[];
  type EducationMap = Record<string, EducationItem>;
  const edu = (
    locale === 'de' ? eduDE :
    locale === 'fr' ? eduFR :
    locale === 'ar' ? eduAR :
    locale === 'pl' ? eduPL :
    locale === 'ru' ? eduRU :
    locale === 'tr' ? eduTR :
    eduEN
  ) as EducationMap;

  const important = ['married_at_birth','paternity_ack','joint_declaration','blocked_contact'];
  const missing = important.filter(k => !interview.answers[k] || interview.answers[k] === 'unsure').slice(0,2);
  const unclear = status === 'unknown';
  const [helpOpen, setHelpOpen] = useState(false);
  const [postcode, setPostcode] = useState('');
  const { preferredCity, setPreferredCity } = useAppStore();
  const [city, setCity] = useState<'berlin'|'hamburg'|'nrw'>(preferredCity || 'berlin');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  type Service = { id: string; type: string; name: string; postcode: string; address: string; phone: string; url: string; opening?: string };
  const [services, setServices] = useState<Service[]>([]);
  const filteredServices = useMemo(() => {
    const pc = postcode.trim();
    return services.filter(s => (pc ? s.postcode.startsWith(pc) : true));
  }, [services, postcode]);
  useEffect(() => {
    if (!helpOpen) return;
    fetch(`/api/directory?city=${city}`)
      .then(r=>r.json())
      .then(d=> setServices(Array.isArray(d.services)? d.services as Service[]: []))
      .catch(()=> setServices([]));
  }, [helpOpen, city]);

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 space-y-6">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-xl font-semibold"
      >
        {t.result.title}
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <StatusCard 
          title={t.result.statuses[status] || status} 
          message={primary?.outcome.message ? (t.rules?.[primary.id as keyof typeof t.rules] || primary.outcome.message) : undefined}
          confidence={confidence} 
          tone={status==='joint_custody_default'?'success':status==='eligible_joint_custody'?'info':status==='apply_contact_order'?'warn':'info'} 
        />
      </motion.div>

      {unclear && (
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.3,delay:0.15}} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button className="rounded-lg border p-3 hover:bg-zinc-50 dark:hover:bg-zinc-200 hover:text-black dark:hover:text-black" onClick={() => {
              const q = missing[0];
              if (!q) return;
              const qKey = (q || '') as keyof TranslationDict['interview']['questions'];
              const payload = { questionId: q, questionText: t.interview.questions[qKey]?.label || q, answers: interview.answers, locale };
              fetch('/api/ai/clarify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
                .then(r => r.json())
                .then(data => alert(`Suggestion: ${data.suggestion} (${Math.round((data.confidence||0)*100)}%)\n${data.followup||''}`))
                .catch(()=>alert('Assistant unavailable at the moment.'));
            }}>Ask the Assistant</button>
            <button className="rounded-lg border p-3 hover:bg-zinc-50 dark:hover:bg-zinc-200 hover:text-black dark:hover:text-black" onClick={() => {
              const q = missing[0] || 'married_at_birth';
              window.location.href = `/interview?q=${q}`;
            }}>Fix Key Detail</button>
            <button className="rounded-lg border p-3 hover:bg-zinc-50 dark:hover:bg-zinc-200 hover:text-black dark:hover:text-black" onClick={() => setHelpOpen(true)}>Find Help Now</button>
          </div>

          {(missing.length ? missing : ['generic']).map((id) => {
            const item: EducationItem = (edu[id] || edu.generic) as EducationItem;
            return <EducationPanel key={id} item={item} />;
          })}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="space-y-2"
      >
        <h2 className="font-medium">{t.result.nextSteps}</h2>
        <div className="grid grid-cols-1 gap-2">
          {(status === 'eligible_joint_custody' || status === 'joint_custody_default') && (
            <Link href="/pdf/gemeinsame-sorge" className="underline">{t.result.generateJointCustody}</Link>
          )}
          {(status === 'apply_contact_order') && (
            <Link href="/pdf/umgangsregelung" className="underline">{t.result.generateContactOrder}</Link>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="space-y-2"
      >
        <h2 className="font-medium">{t.result.sources}</h2>
        <ul className="list-disc pl-5 text-sm">
          {citations.map((c, i) => {
            const citation: Citation = typeof c === 'string' ? { url: c } : c;
            return (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.4 + i * 0.05 }}
              >
                <a href={citation.url || ''} target="_blank" rel="noopener noreferrer" className="underline">
                  {citation.label || citation.url || ''}
                </a>
                {citation.snapshotId ? <span className="ml-2 text-xs text-zinc-500">({citation.snapshotId})</span> : null}
              </motion.li>
            );
          })}
        </ul>
      </motion.div>

      {matched.length > 1 && (
        <motion.details
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="text-xs text-zinc-500"
        >
          <summary>Additional matched rules</summary>
          <ul className="list-disc pl-5">
            {matched.slice(1).map((m) => (
              <li key={m.id}>{m.id}: {m.outcome.status}</li>
            ))}
          </ul>
        </motion.details>
      )}

      {/* Help Sheet (lightweight modal) */}
      {helpOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
        <div className="w-full sm:max-w-lg bg-white dark:bg-zinc-950 rounded-t-2xl sm:rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-medium">Find Help Now</div>
            <button className="text-sm underline" onClick={() => setHelpOpen(false)}>Close</button>
          </div>
          <div className="text-sm text-zinc-700 dark:text-zinc-300">
            Call your nearest Jugendamt or court registry. Use the script below; tap to copy. You can also add a calendar reminder.
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs uppercase text-zinc-500 mb-1">What to say (German)</div>
            <textarea className="w-full rounded border p-2 text-sm" rows={4} readOnly onClick={(e) => (e.target as HTMLTextAreaElement).select()} value="Guten Tag, ich benötige Informationen zu Sorgerecht/Umgang. Ich möchte wissen, welche Unterlagen ich mitbringen muss und wie ich einen Termin bekomme. Vielen Dank!"></textarea>
            <div className="mt-2 flex gap-2">
              <button className="rounded border px-3 py-1 text-sm" onClick={() => navigator.clipboard.writeText('Guten Tag, ich benötige Informationen zu Sorgerecht/Umgang. Ich möchte wissen, welche Unterlagen ich mitbringen muss und wie ich einen Termin bekomme. Vielen Dank!')}>Copy</button>
              <button className="rounded border px-3 py-1 text-sm" onClick={() => {
                const ics = buildICS({ summary: 'Call Jugendamt', startISO: new Date(Date.now()+24*60*60*1000).toISOString(), durationMinutes: 15 });
                const blob = new Blob([ics], { type: 'text/calendar' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = 'call-jugendamt.ics'; a.click(); URL.revokeObjectURL(url);
              }}>Add reminder</button>
            </div>
          </div>
          <div className="rounded-lg border p-3 space-y-2">
            <div className="text-xs uppercase text-zinc-500">Nearby services</div>
            <div className="flex gap-2 items-center">
              <select value={city} onChange={(e)=>{ const v = e.target.value as 'berlin'|'hamburg'|'nrw'; setCity(v); setPreferredCity(v); }} className="rounded border px-2 py-1 text-sm">
                <option value="berlin">Berlin</option>
                <option value="hamburg">Hamburg</option>
                <option value="nrw">NRW</option>
              </select>
              <input value={postcode} onChange={(e)=>setPostcode(e.target.value)} placeholder="Postcode (e.g. 10115)" className="flex-1 rounded border px-3 py-1 text-sm" />
              <button
                className="rounded border px-2 py-1 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-200 hover:text-black dark:hover:text-black"
                onClick={() => {
                  setGeoError(''); setGeoLoading(true);
                  if (!('geolocation' in navigator)) { setGeoError('Location unavailable'); setGeoLoading(false); return; }
                  navigator.geolocation.getCurrentPosition(async (pos) => {
                    try {
                      const { latitude, longitude } = pos.coords;
                      const res = await fetch(`/api/revgeo?lat=${latitude}&lon=${longitude}`);
                      const j = await res.json() as { postcode?: string; error?: string };
                      if (j.postcode) setPostcode(j.postcode);
                      else if (j.error) setGeoError(j.error);
                    } catch (err) {
                      console.error(err);
                      setGeoError('Failed to detect postcode');
                    } finally {
                      setGeoLoading(false);
                    }
                  }, () => { setGeoError('Permission denied'); setGeoLoading(false); });
                }}
              >Use my location</button>
              <span title="We only use your location to find your postcode. No location data is stored or sent elsewhere." className="text-zinc-500" aria-label="Privacy note">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <circle cx="12" cy="16" r="1" />
                </svg>
              </span>
            </div>
            {geoLoading && <div className="text-xs text-zinc-500">Detecting…</div>}
            {!!geoError && <div className="text-xs text-red-600">{geoError}</div>}
            <div className="space-y-2 max-h-64 overflow-auto">
              {filteredServices.length===0 && <div className="text-sm text-zinc-500">No services yet. Try a postcode.</div>}
              {filteredServices.slice(0,6).map(s => (
                <div key={s.id} className="rounded border p-2">
                  <div className="text-xs uppercase text-zinc-500">{s.type}</div>
                  <div className="font-medium text-sm">{s.name}</div>
                  <div className="text-sm text-zinc-600">{s.address}</div>
                  {s.phone && <a className="text-sm underline" href={`tel:${s.phone}`}>{s.phone}</a>}
                  {s.url && <a className="ml-2 text-sm underline" href={s.url} target="_blank">Website</a>}
                  {s.opening && <div className="text-xs text-zinc-500">{s.opening}</div>}
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs text-zinc-500">Information only — not individualized legal advice.</div>
        </div>
        </div>
      )}
    </div>
  );
}
