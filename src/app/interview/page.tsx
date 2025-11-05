"use client";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import Progress from "@/components/Progress";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app";
import questions from "@/data/questions";
import type { ClarifyResponse } from "@/types/ai";
import type { TranslationDict } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

type Q = { id: string; type?: "yn" | "enum"; options?: { value: string; label: string }[] };

type QuestionKey = keyof TranslationDict["interview"]["questions"];

export default function Interview() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { setAnswer, interview } = useAppStore();
  const [step, setStep] = useState(0);

  // Deep link support: /interview?q=questionId (useEffect to avoid hydration mismatch)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search).get("q");
    if (!q) return;
    const idx = (questions as Q[]).findIndex((x) => x.id === q);
    if (idx >= 0 && idx !== step) setStep(idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = (questions as Q[])[step];
  const [clarify, setClarify] = useState<{
    loading: boolean;
    data?: ClarifyResponse;
    error?: string;
  }>({ loading: false });
  const questionKey = current.id as QuestionKey;
  const questionData = t.interview.questions[questionKey];

  // Clear clarify state when step changes
  useEffect(() => {
    setClarify({ loading: false });
  }, [step]);

  function onSelect(value: string) {
    setClarify({ loading: false });
    setAnswer(current.id, value);
    if (step < questions.length - 1) setStep(step + 1);
    else router.push("/result");
  }

  async function onClarify() {
    setClarify({ loading: true });
    try {
      const res = await fetch("/api/ai/clarify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: current.id,
          questionText: questionData?.label || current.id,
          answers: interview.answers,
          locale: locale === "de" ? "de" : "en",
          context: questionData?.help || "",
        }),
      });
      const data = (await res.json()) as ClarifyResponse;
      setClarify({ loading: false, data });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed";
      setClarify({ loading: false, error: msg });
    }
  }

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-6">
      <div className="sticky top-0 z-10 bg-[var(--background)]/90 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md py-2">
        <Progress current={step} total={questions.length} />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={stepVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <div className="text-sm text-zinc-500">{t.interview.title}</div>
            <h2 className="text-lg font-semibold">{questionData?.label || current.id}</h2>
            <p className="text-sm text-zinc-600">{questionData?.help || t.interview.help}</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {current.type !== "enum" && (
              <>
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  onClick={() => onSelect("yes")}
                  className="rounded-lg border p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-200 hover:text-black dark:hover:text-black"
                >
                  {t.common.yes}
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  onClick={() => onSelect("no")}
                  className="rounded-lg border p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-200 hover:text-black dark:hover:text-black"
                >
                  {t.common.no}
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => onSelect("unsure")}
                  className="rounded-lg border p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-200 hover:text-black dark:hover:text-black"
                >
                  {t.common.unsure}
                </motion.button>
              </>
            )}
            {current.type === "enum" && (
              <>
                {current.options?.map((o, i) => {
                  const questionOptions =
                    questionData && "options" in questionData ? questionData.options : undefined;
                  const translatedLabel =
                    questionOptions?.[o.value as keyof typeof questionOptions] || o.label;
                  return (
                    <motion.button
                      key={o.value}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                      onClick={() => onSelect(o.value)}
                      className="rounded-lg border p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-200 hover:text-black dark:hover:text-black"
                    >
                      {translatedLabel}
                    </motion.button>
                  );
                })}
              </>
            )}
          </div>

          <div className="mt-2 flex items-center gap-3">
            <button onClick={onClarify} className="text-sm underline decoration-dotted">
              Need help?
            </button>
            {clarify.loading && <span className="text-xs text-zinc-500">Thinking…</span>}
          </div>

          {clarify.data && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border p-3 bg-zinc-50 dark:bg-zinc-900"
            >
              <div className="text-sm">
                Suggestion: <b>{clarify.data.suggestion}</b>{" "}
                <span className="text-xs text-zinc-500">
                  ({Math.round(clarify.data.confidence * 100)}%)
                </span>
              </div>
              {clarify.data.followup && (
                <div className="text-sm mt-1">Follow‑up: {clarify.data.followup}</div>
              )}
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => onSelect(clarify.data!.suggestion)}
                  className="rounded border px-3 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-200 hover:text-black dark:hover:text-black text-sm"
                >
                  Accept
                </button>
                <button
                  onClick={() => setClarify({ loading: false })}
                  className="rounded border px-3 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-200 hover:text-black dark:hover:text-black text-sm"
                >
                  Dismiss
                </button>
              </div>
              <div className="text-[11px] text-zinc-500 mt-2">
                Information only — not individualized legal advice.
              </div>
            </motion.div>
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
