"use client";
import { Suspense } from "react";
import { useI18n } from "@/i18n";
import { useSearchParams } from "next/navigation";

/**
 * Inner component that uses useSearchParams - must be wrapped in Suspense
 */
function ThanksPageContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();

  const pickParam = (key: string): string | undefined => {
    return searchParams.get(key) || undefined;
  };

  const refCode = pickParam("ref") || pickParam("partner") || pickParam("utm_campaign");

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-12 text-center">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {t.thanks?.title || "Thank you for visiting!"}
      </h1>
      <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-2">
        {refCode
          ? (t.thanks?.referralCode || "Your referral/campaign code: {code}").replace(
              "{code}",
              refCode
            )
          : t.thanks?.message || "We appreciate your interest in Custody Clarity."}
      </p>
      <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-4">
        {t.thanks?.startInterview || "Start the interview to get your result in minutes."}
      </p>
      <div className="mt-6">
        <a
          href="/interview"
          className="inline-block rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-700 px-6 py-3 text-sm hover:bg-black dark:hover:bg-white"
        >
          {t.thanks?.beginInterview || "Begin Interview"}
        </a>
      </div>
    </div>
  );
}

/**
 * Thank‑you page implemented as a Client Component to use
 * i18n translations. Reads search params using useSearchParams hook.
 * Wrapped in Suspense boundary as required by Next.js.
 */
export default function ThanksPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-xl mx-auto px-4 py-12 text-center">
          <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Loading...</div>
        </div>
      }
    >
      <ThanksPageContent />
    </Suspense>
  );
}
