"use client";
import { useState } from 'react';
import { useI18n } from '@/i18n';
import Progress from '@/components/Progress';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/app';
import questions from '@/data/questions';
import type { ClarifyResponse } from '@/types/ai';
import type { TranslationDict } from '@/types';

type Q = { id: string; type?: 'yn' | 'enum'; options?: { value: string; label: string }[] };

type QuestionKey = keyof TranslationDict['interview']['questions'];

export default function Interview() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { setAnswer, interview } = useAppStore();
  const [step, setStep] = useState(0);

  const current = (questions as Q[])[step];
  const [clarify, setClarify] = useState<{loading: boolean; data?: ClarifyResponse; error?: string}>({ loading: false });
  const questionKey = current.id as QuestionKey;
  const questionData = t.interview.questions[questionKey];

  function onSelect(value: string) {
    setAnswer(current.id, value);
    if (step < questions.length - 1) setStep(step + 1);
    else router.push('/result');
  }

  async function onClarify() {
    setClarify({ loading: true });
    try {
      const res = await fetch('/api/ai/clarify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: current.id,
          questionText: questionData?.label || current.id,
          answers: interview.answers,
          locale: locale === 'de' ? 'de' : 'en',
          context: questionData?.help || '',
        }),
      });
      const data = await res.json() as ClarifyResponse;
      setClarify({ loading: false, data });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed';
      setClarify({ loading: false, error: msg });
    }
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
            <button onClick={() => onSelect('yes')} className="rounded-lg border p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-200 hover:text-black dark:hover:text-black">
              {t.common.yes}
            </button>
            <button onClick={() => onSelect('no')} className="rounded-lg border p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-200 hover:text-black dark:hover:text-black">
              {t.common.no}
            </button>
            <button onClick={() => onSelect('unsure')} className="rounded-lg border p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-200 hover:text-black dark:hover:text-black">
              {t.common.unsure}
            </button>
          </>
        )}
        {current.type === 'enum' && (
          <>
            {current.options?.map((o) => (
              <button key={o.value} onClick={() => onSelect(o.value)} className="rounded-lg border p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-200 hover:text-black dark:hover:text-black">
                {o.label}
              </button>
            ))}
          </>
        )}
      </div>

      <div className="mt-2 flex items-center gap-3">
        <button onClick={onClarify} className="text-sm underline decoration-dotted">Need help?</button>
        {clarify.loading && <span className="text-xs text-zinc-500">Thinking…</span>}
      </div>

      {clarify.data && (
        <div className="rounded-lg border p-3 bg-zinc-50 dark:bg-zinc-900">
          <div className="text-sm">Suggestion: <b>{clarify.data.suggestion}</b> <span className="text-xs text-zinc-500">({Math.round(clarify.data.confidence*100)}%)</span></div>
          {clarify.data.followup && <div className="text-sm mt-1">Follow‑up: {clarify.data.followup}</div>}
          <div className="mt-2 flex gap-2">
            <button onClick={() => onSelect(clarify.data!.suggestion)} className="rounded border px-3 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-200 hover:text-black dark:hover:text-black text-sm">Accept</button>
            <button onClick={() => setClarify({ loading: false })} className="rounded border px-3 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-200 hover:text-black dark:hover:text-black text-sm">Dismiss</button>
          </div>
          <div className="text-[11px] text-zinc-500 mt-2">Information only — not individualized legal advice.</div>
        </div>
      )}

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
