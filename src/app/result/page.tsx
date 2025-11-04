"use client";
import rules from '@/data/rules.json';
import { evaluateRules } from '@/lib/rules';
import { useAppStore } from '@/store/app';
import { useI18n } from '@/i18n';
import Link from 'next/link';
import type { SimpleRule, Citation } from '@/lib/rules';
import StatusCard from '@/components/StatusCard';
import type { TranslationDict } from '@/types';
import { motion } from 'framer-motion';

type StatusKey = keyof TranslationDict['result']['statuses'];

export default function Result() {
  const { interview } = useAppStore();
  const { t } = useI18n();
  const { matched, primary, confidence } = evaluateRules(rules as SimpleRule[], interview.answers);

  const status = (primary?.outcome.status || 'unknown') as StatusKey;
  const citations = (primary?.outcome.citations || []) as (Citation | string)[];

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
        <StatusCard title={t.result.statuses[status] || status} message={primary?.outcome.message} confidence={confidence} tone={status==='joint_custody_default'?'success':status==='eligible_joint_custody'?'info':status==='apply_contact_order'?'warn':'info'} />
      </motion.div>

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
    </div>
  );
}
