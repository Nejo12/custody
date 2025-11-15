"use client";
import { useI18n } from "@/i18n";

/**
 * HowItWorks Component
 * Displays a 4-step visual process explaining how the custody rights tool works
 */
export default function HowItWorks() {
  const { t } = useI18n();

  const steps = [
    {
      title: t.home?.howItWorksStep1Title || "Answer Questions",
      description:
        t.home?.howItWorksStep1Description || "Answer simple questions about your situation",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      title: t.home?.howItWorksStep2Title || "Get Results",
      description:
        t.home?.howItWorksStep2Description || "Get instant results with legal citations from BGB",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
    },
    {
      title: t.home?.howItWorksStep3Title || "Download PDF",
      description: t.home?.howItWorksStep3Description || "Download your personalized PDF document",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      title: t.home?.howItWorksStep4Title || "Take Action",
      description: t.home?.howItWorksStep4Description || "Take informed action with confidence",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center text-zinc-900 dark:text-zinc-50">
        {t.home?.howItWorksTitle || "How It Works"}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {steps.map((step, index) => (
          <div
            key={index}
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 space-y-2"
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                {step.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {step.title}
                </h3>
              </div>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 pl-[52px]">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
