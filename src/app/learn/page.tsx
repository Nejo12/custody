"use client";
import { useI18n } from '@/i18n';
import explainers from '@/data/explainers.json';

type Explainer = { slug: string; title: string; url: string; snapshotId: string; lastVerified: string };

export default function LearnPage() {
  const { t } = useI18n();
  const items = explainers as Explainer[];
  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-semibold">{t.home.learn}</h1>
      <ul className="space-y-2">
        {items.map((e) => (
          <li key={e.slug} className="rounded-lg border p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900">
            <a href={e.url} target="_blank" rel="noopener noreferrer" className="font-medium underline">{e.title}</a>
            <div className="text-xs text-zinc-500 mt-1">Last verified: {e.lastVerified} · Snapshot: {e.snapshotId}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
