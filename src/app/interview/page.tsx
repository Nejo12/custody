"use client";
import { useMemo, useState } from 'react';
import { useI18n } from '@/i18n';
import Progress from '@/components/Progress';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/app';
import type { TranslationDict } from '@/types';

type Q = { id: string; type?: 'yn' | 'enum'; options?: { value: string; label: string }[] };

type QuestionKey = keyof TranslationDict['interview']['questions'];

export default function Interview() {
  const { t } = useI18n();
  const router = useRouter();
  const { setAnswer } = useAppStore();
  const [step, setStep] = useState(0);

  const questions: Q[] = useMemo(() => [
    { id: 'married_at_birth', type: 'yn' },
    { id: 'paternity_ack', type: 'yn' },
    { id: 'joint_declaration', type: 'yn' },
    { id: 'court_order', type: 'enum', options: [
      { value: 'none', label: 'No order' },
      { value: 'exists', label: 'Yes, order exists' },
      { value: 'unknown', label: 'Not sure' },
    ] },
    { id: 'blocked_contact', type: 'yn' },
  ], []);

  const current = questions[step];
  const questionKey = current.id as QuestionKey;
  const questionData = t.interview.questions[questionKey];

  function onSelect(value: string) {
    // Map yn answers
    const v = value as string;
    setAnswer(current.id, v);
    if (step < questions.length - 1) setStep(step + 1);
    else router.push('/result');
  }

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-6">
      <Progress current={step} total={questions.length} />
      <div className="space-y-2">
        <div className="text-sm text-zinc-500">{t.interview.title}</div>
        <h2 className="text-lg font-semibold">
          {questionData?.label || current.id}
        </h2>
        <p className="text-sm text-zinc-600">
          {questionData?.help || t.interview.help}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {current.type !== 'enum' && (
          <>
            <button onClick={() => onSelect('yes')} className="rounded-lg border p-4 text-left hover:bg-zinc-50">
              {t.common.yes}
            </button>
            <button onClick={() => onSelect('no')} className="rounded-lg border p-4 text-left hover:bg-zinc-50">
              {t.common.no}
            </button>
            <button onClick={() => onSelect('unsure')} className="rounded-lg border p-4 text-left hover:bg-zinc-50">
              {t.common.unsure}
            </button>
          </>
        )}
        {current.type === 'enum' && (
          <>
            {current.options?.map((o) => (
              <button key={o.value} onClick={() => onSelect(o.value)} className="rounded-lg border p-4 text-left hover:bg-zinc-50">
                {o.label}
              </button>
            ))}
          </>
        )}
      </div>

      <div className="flex justify-between pt-2">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="text-sm text-zinc-700 underline disabled:text-zinc-300"
          disabled={step === 0}
        >
          {t.common.back}
        </button>
        <div className="text-sm text-zinc-500">
          {step + 1} / {questions.length}
        </div>
      </div>
    </div>
  );
}

