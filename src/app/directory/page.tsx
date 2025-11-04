"use client";
import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '@/i18n';

type Service = { id: string; type: string; name: string; postcode: string; address: string; phone: string; url: string; opening?: string };

export default function DirectoryPage() {
  const { t } = useI18n();
  const [services, setServices] = useState<Service[]>([]);
  const [q, setQ] = useState('');
  const [type, setType] = useState<string>('');

  useEffect(() => {
    fetch('/api/directory?city=berlin' + (type ? `&type=${type}` : ''))
      .then((r) => r.json())
      .then((d) => setServices(d.services || []));
  }, [type]);

  const filtered = useMemo(() => {
    const trimmed = q.trim();
    return services.filter((s) => (trimmed ? s.postcode.startsWith(trimmed) : true));
  }, [services, q]);

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-semibold">{t.directory.title}</h1>
      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="flex-1 rounded border px-3 py-2"
          placeholder={t.directory.searchPlaceholder}
        />
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded border px-3 py-2">
          <option value="">{t.directory.typeFilter}</option>
          <option value="jugendamt">{t.directory.jugendamt}</option>
          <option value="court">{t.directory.court}</option>
          <option value="mediation">{t.directory.mediation}</option>
          <option value="legal_aid">{t.directory.legal_aid}</option>
          <option value="counseling">{t.directory.counseling}</option>
          <option value="support_group">{t.directory.support_group}</option>
        </select>
      </div>
      <div className="space-y-3">
        {filtered.length === 0 && <div className="text-sm text-zinc-500">{t.directory.noResults}</div>}
        {filtered.map((s) => (
          <div key={s.id} className="rounded-lg border p-4">
            <div className="text-sm uppercase tracking-wide text-zinc-500">{s.type}</div>
            <div className="font-medium">{s.name}</div>
            <div className="text-sm text-zinc-600">{s.address}</div>
            <div className="text-sm">{s.phone}</div>
            <a href={s.url} target="_blank" className="text-sm underline">{s.url}</a>
            {s.opening && <div className="text-xs text-zinc-500 mt-1">{s.opening}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

