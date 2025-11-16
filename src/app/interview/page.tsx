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
import VoiceInput from "@/components/VoiceInput";
import DisclaimerAcknowledgmentModal from "@/components/DisclaimerAcknowledgmentModal";

type Q = { id: string; type?: "yn" | "enum"; options?: { value: string; label: string }[] };

type QuestionKey = keyof TranslationDict["interview"]["questions"];

export default function Interview() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { setAnswer, interview, setDisclaimerAcknowledged } = useAppStore();
  const [step, setStep] = useState(0);

  // Disclaimer modal state
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);

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

  /**
   * Handle answer selection
   * On the final question, shows disclaimer modal instead of navigating directly to results
   */
  function onSelect(value: string) {
    setClarify({ loading: false });
    setAnswer(current.id, value);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Last question answered - show disclaimer modal before results
      setShowDisclaimerModal(true);
    }
  }

  /**
   * Handle disclaimer acknowledgment
   * Stores acknowledgment in state and navigates to results page
   */
  function handleDisclaimerAcknowledged() {
    setDisclaimerAcknowledged(true);
    setShowDisclaimerModal(false);
    router.push("/result");
  }

  function normalize(s: string): string {
    return s.toLowerCase().normalize("NFC");
  }

  function suggestFromSpeech(text: string): string | undefined {
    const n = normalize(text);
    // Boolean style
    if (current.type !== "enum") {
      if (/(^|\b)(yes|yeah|yep)\b/.test(n) || /(^|\b)(ja)\b/.test(n)) return "yes";
      if (/(^|\b)(no|nope)\b/.test(n) || /(^|\b)(nein)\b/.test(n)) return "no";
      if (/not sure|unsure|weiß nicht|nicht sicher/.test(n)) return "unsure";
      return undefined;
    }
    // Enum: try to match option labels
    const opts = current.options || [];
    const questionOptions =
      questionData && (questionData as { options?: Record<string, string> }).options
        ? (questionData as { options?: Record<string, string> }).options
        : undefined;
    let best: { value: string; score: number } | null = null;
    for (const o of opts) {
      const label =
        (questionOptions?.[o.value as keyof typeof questionOptions] as string) || o.label;
      const ln = normalize(label);
      let score = 0;
      if (n.includes(ln)) score = ln.length;
      else if (ln.includes(n)) score = n.length;
      if (score > (best?.score || 0)) best = { value: o.value, score };
    }
    return best?.score && best.score > 2 ? best.value : undefined;
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
          locale: locale,
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
            <div className="text-sm text-zinc-700 dark:text-zinc-400">{t.interview.title}</div>
            <h2 className="text-lg font-semibold">{questionData?.label || current.id}</h2>
            <details className="rounded border p-3 bg-zinc-50 dark:bg-zinc-900 text-sm">
              <summary className="cursor-pointer font-medium text-zinc-800 dark:text-zinc-200">
                {t.education?.headings?.why || "Why this question matters"}
              </summary>
              <div className="mt-1 text-zinc-500 dark:text-zinc-300">
                {questionData?.help || t.interview.help}
              </div>
            </details>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {current.type !== "enum" && (
              <>
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  onClick={() => onSelect("yes")}
                  className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  {t.common.yes}
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  onClick={() => onSelect("no")}
                  className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 text-left text-zinc-500 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  {t.common.no}
                </motion.button>
                {/* Unsure is provided via Skip control below */}
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
                      className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 text-left text-zinc-500 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      {translatedLabel}
                    </motion.button>
                  );
                })}
              </>
            )}
          </div>

          {/* Voice input */}
          <VoiceInput
            target="both"
            onTranscript={(text) => {
              const v = suggestFromSpeech(text);
              if (v)
                setClarify({
                  loading: false,
                  data: { suggestion: v as "yes" | "no" | "unsure", confidence: 0.9 },
                });
            }}
          />

          <div className="mt-2 flex items-center gap-3">
            <button
              onClick={onClarify}
              className="text-sm text-zinc-700 dark:text-zinc-400 underline decoration-dotted hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              {t.result?.askAssistant || "Ask the Assistant"}
            </button>
            {clarify.loading && (
              <span className="text-xs text-zinc-700 dark:text-zinc-400">
                {t.result?.thinking || "Thinking…"}
              </span>
            )}
          </div>

          {clarify.data && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-zinc-300 dark:border-zinc-700 p-3 bg-zinc-50 dark:bg-zinc-900"
              role="status"
              aria-live="polite"
            >
              <div className="text-sm text-zinc-500 dark:text-zinc-300">
                {(t.result?.answerNow || "Answer now:") + " "}
                <b>
                  {clarify.data.suggestion === "yes"
                    ? t.common.yes
                    : clarify.data.suggestion === "no"
                      ? t.common.no
                      : t.common.unsure}
                </b>{" "}
                <span className="text-xs text-zinc-700 dark:text-zinc-400">
                  ({Math.round(clarify.data.confidence * 100)}%)
                </span>
              </div>
              {clarify.data.followup && (
                <div className="text-sm text-zinc-500 dark:text-zinc-300 mt-1">
                  {clarify.data.followup}
                </div>
              )}
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => onSelect(clarify.data!.suggestion)}
                  className="rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1 text-sm text-zinc-500 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                >
                  {t.result?.accept || "Accept"}
                </button>
                <button
                  type="button"
                  onClick={() => setClarify({ loading: false })}
                  className="rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1 text-sm text-zinc-500 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                >
                  {t.helpSheet?.close || "Close"}
                </button>
              </div>
              <div className="text-[11px] text-zinc-700 dark:text-zinc-400 mt-2">
                {t.helpSheet?.disclaimer || "Information only — not individualized legal advice."}
              </div>
            </motion.div>
          )}

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="text-sm text-zinc-700 dark:text-zinc-400 underline hover:text-zinc-900 dark:hover:text-zinc-200 disabled:text-zinc-400 dark:disabled:text-zinc-600"
              disabled={step === 0}
            >
              {t.common.back}
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onSelect("unsure")}
                className="text-sm text-zinc-700 dark:text-zinc-400 underline hover:text-zinc-900 dark:hover:text-zinc-200"
              >
                {t.common?.unsure || "Not sure"}
              </button>
              <div className="text-sm text-zinc-700 dark:text-zinc-400">
                {step + 1} / {questions.length}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Disclaimer Acknowledgment Modal - shown after completing all questions */}
      <DisclaimerAcknowledgmentModal
        open={showDisclaimerModal}
        onAcknowledge={handleDisclaimerAcknowledged}
      />
    </div>
  );
}
