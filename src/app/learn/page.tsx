"use client";
import { useI18n } from '@/i18n';

export default function LearnPage() {
  const { t } = useI18n();
  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-semibold">{t.home.learn}</h1>
      <p className="text-sm text-zinc-700">This section will include explainers, glossary, and source snapshots. Coming soon.</p>
    </div>
  );
}

