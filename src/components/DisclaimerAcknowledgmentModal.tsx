"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/i18n";
import { usePrefersReducedMotion } from "@/lib/hooks";

/**
 * DisclaimerAcknowledgmentModal Component
 *
 * A prominent, mandatory disclaimer modal that appears after users complete
 * the interview and before they can view their results. This modal:
 * - Uses bold red/orange styling for high visibility
 * - Displays legal disclaimer text in all-caps
 * - Requires explicit user acknowledgment via checkbox
 * - Follows WCAG accessibility guidelines
 * - Supports dark mode and reduced motion preferences
 *
 * @param {boolean} open - Controls modal visibility
 * @param {() => void} onAcknowledge - Callback fired when user acknowledges disclaimer
 */
export default function DisclaimerAcknowledgmentModal({
  open,
  onAcknowledge,
}: {
  open: boolean;
  onAcknowledge: () => void;
}) {
  const { t } = useI18n();
  const prefersReduced = usePrefersReducedMotion();

  // Checkbox state for user acknowledgment
  const [isChecked, setIsChecked] = useState(false);

  /**
   * Lock body scroll when modal is open to prevent background scrolling
   * Restores original overflow value when modal closes
   */
  useEffect(() => {
    if (open) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [open]);

  /**
   * Reset checkbox state whenever modal is reopened
   * Ensures user must re-acknowledge each time
   */
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        setIsChecked(false);
      }, 100);
    }
  }, [open]);

  /**
   * Handle continue button click
   * Only triggers callback if checkbox is checked
   */
  const handleContinue = () => {
    if (isChecked) {
      onAcknowledge();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="disclaimer-title"
          initial={{ opacity: prefersReduced ? 1 : 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: prefersReduced ? 1 : 0 }}
        >
          {/* Dark backdrop overlay - cannot be clicked to close */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-hidden="true"
            initial={{ opacity: prefersReduced ? 1 : 0 }}
            animate={{ opacity: 1, transition: { duration: prefersReduced ? 0 : 0.15 } }}
            exit={{
              opacity: prefersReduced ? 1 : 0,
              transition: { duration: prefersReduced ? 0 : 0.12 },
            }}
          />

          {/* Modal content container */}
          <div className="absolute inset-0 flex items-center justify-center p-4 overflow-hidden">
            <motion.div
              className="dialog-panel w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden flex flex-col max-h-[90vh]"
              initial={{
                y: prefersReduced ? 0 : 56,
                opacity: prefersReduced ? 1 : 0,
                scale: prefersReduced ? 1 : 0.95,
              }}
              animate={{
                y: 0,
                opacity: 1,
                scale: 1,
                transition: prefersReduced
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 380, damping: 28 },
              }}
              exit={{
                y: prefersReduced ? 0 : 28,
                opacity: prefersReduced ? 1 : 0,
                scale: prefersReduced ? 1 : 0.95,
                transition: prefersReduced
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 320, damping: 30 },
              }}
            >
              {/* Prominent red/orange border warning box */}
              <div className="border-4 border-red-600 dark:border-orange-500 bg-red-50 dark:bg-red-950/30 p-6 flex-shrink-0">
                {/* Warning icon */}
                <div className="flex justify-center mb-4">
                  <svg
                    className="w-16 h-16 text-red-600 dark:text-orange-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>

                {/* Main heading - all caps, prominent */}
                <h2
                  id="disclaimer-title"
                  className="text-2xl md:text-3xl font-bold text-red-700 dark:text-red-500 uppercase text-center mb-3 tracking-wide"
                >
                  {t.disclaimer.title}
                </h2>

                {/* Subtitle - all caps, bold */}
                <p className="text-xl md:text-2xl font-bold text-red-600 dark:text-orange-500 uppercase text-center mb-4">
                  {t.disclaimer.subtitle}
                </p>

                {/* No attorney-client relationship statement */}
                <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 text-center mb-2">
                  {t.disclaimer.noAttorneyRelation}
                </p>
              </div>

              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Detailed disclaimer sections */}
                <div className="space-y-3">
                  {t.disclaimer.sections.map((section: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 text-zinc-800 dark:text-zinc-200"
                    >
                      <span className="text-red-600 dark:text-orange-500 font-bold flex-shrink-0 mt-0.5">
                        •
                      </span>
                      <p className="text-base leading-relaxed">{section}</p>
                    </div>
                  ))}
                </div>

                {/* Additional context */}
                <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-4">
                  <p className="text-sm text-zinc-700 dark:text-zinc-400">{t.disclaimer.context}</p>
                </div>
              </div>

              {/* Footer with checkbox and continue button */}
              <div className="border-t border-zinc-200 dark:border-zinc-800 p-6 space-y-4 flex-shrink-0 bg-zinc-50 dark:bg-zinc-900/30">
                {/* Mandatory acknowledgment checkbox */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-2 border-zinc-400 dark:border-zinc-600 text-red-600 focus:ring-2 focus:ring-red-500 dark:focus:ring-orange-500 cursor-pointer flex-shrink-0"
                    aria-describedby="disclaimer-title"
                  />
                  <span className="text-base text-zinc-900 dark:text-zinc-100 font-medium group-hover:text-zinc-700 dark:group-hover:text-zinc-300">
                    {t.disclaimer.acknowledgment}
                  </span>
                </label>

                {/* Continue button - disabled until checkbox is checked */}
                <button
                  onClick={handleContinue}
                  disabled={!isChecked}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all focus:outline-none focus:ring-4 ${
                    isChecked
                      ? "bg-red-600 hover:bg-red-700 dark:bg-orange-600 dark:hover:bg-orange-700 text-white focus:ring-red-300 dark:focus:ring-orange-300 cursor-pointer shadow-lg hover:shadow-xl"
                      : "bg-zinc-300 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-500 cursor-not-allowed opacity-60"
                  }`}
                  aria-label={isChecked ? t.disclaimer.continue : t.disclaimer.continueDisabled}
                >
                  {t.disclaimer.continue}
                </button>

                {/* Helper text for disabled button */}
                {!isChecked && (
                  <p className="text-sm text-center text-zinc-600 dark:text-zinc-400">
                    {t.disclaimer.checkboxRequired}
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
