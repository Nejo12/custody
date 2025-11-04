"use client";
import { useState } from 'react';
import { useI18n } from '@/i18n';

export type EducationItem = {
  title: string;
  why: string;
  law: string;
  unsure: string;
  citations: { label?: string; url: string; snapshotId?: string }[];
};

export default function EducationPanel({ item }: { item: EducationItem }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-lg border p-4">
      <button className="w-full text-left font-medium" onClick={() => setOpen(v => !v)}>
        {item.title}
      </button>
      {open && (
        <div className="mt-3 space-y-3 text-sm">
          <section>
            <div className="font-medium">{t.education.headings.why}</div>
            <p className="text-zinc-700 dark:text-zinc-300">{item.why}</p>
          </section>
          <section>
            <div className="font-medium">{t.education.headings.law}</div>
            <p className="text-zinc-700 dark:text-zinc-300">{item.law}</p>
          </section>
          <section>
            <div className="font-medium">{t.education.headings.unsure}</div>
            <p className="text-zinc-700 dark:text-zinc-300">{item.unsure}</p>
          </section>
          {!!item.citations?.length && (
            <section>
              <div className="font-medium">{t.education.headings.sources}</div>
              <ul className="list-disc pl-5">
                {item.citations.map((c, i) => (
                  <li key={i}>
                    <a className="underline" href={c.url} target="_blank" rel="noopener noreferrer">{c.label || c.url}</a>
                    {c.snapshotId && <span className="ml-2 text-xs text-zinc-500">({c.snapshotId})</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
