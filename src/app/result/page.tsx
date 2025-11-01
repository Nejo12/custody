"use client";
import rules from '@/data/rules.json';
import { evaluateRules } from '@/lib/rules';
import { useAppStore } from '@/store/app';
import { useI18n } from '@/i18n';
import Link from 'next/link';

export default function Result() {
  const { interview } = useAppStore();
  const { t } = useI18n();
  const { matched, primary } = evaluateRules(rules as any, interview.answers);

  const status = primary?.outcome.status || 'unknown';
  const citations = primary?.outcome.citations || [];

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-xl font-semibold">{t.result.title}</h1>
      <div className="rounded-lg border p-4">
        <div className="text-2xl">{(t.result.statuses as any)[status] || status}</div>
        {primary?.outcome.message && (
          <p className="text-sm text-zinc-600 mt-2">{primary.outcome.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <h2 className="font-medium">{t.result.nextSteps}</h2>
        <div className="grid grid-cols-1 gap-2">
          {(status === 'eligible_joint_custody' || status === 'joint_custody_default') && (
            <Link href="/pdf/gemeinsame-sorge" className="underline">{t.result.generateJointCustody}</Link>
          )}
          {(status === 'apply_contact_order') && (
            <Link href="/pdf/umgangsregelung" className="underline">{t.result.generateContactOrder}</Link>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="font-medium">{t.result.sources}</h2>
        <ul className="list-disc pl-5 text-sm">
          {(citations as any[]).map((c: any, i) => (
            <li key={i}>
              <a href={c.url || c} target="_blank" className="underline">{c.label || c.url || c}</a>
              {c.snapshotId ? <span className="ml-2 text-xs text-zinc-500">({c.snapshotId})</span> : null}
            </li>
          ))}
        </ul>
      </div>

      {matched.length > 1 && (
        <details className="text-xs text-zinc-500">
          <summary>Additional matched rules</summary>
          <ul className="list-disc pl-5">
            {matched.slice(1).map((m) => (
              <li key={m.id}>{m.id}: {m.outcome.status}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

