"use client";
import Link from "next/link";
import { useI18n } from "@/i18n";
import FadeIn from "@/components/FadeIn";
import NewsletterSignup from "@/components/NewsletterSignup";

export default function HomeClient() {
  const { t } = useI18n();
  return (
    <div className="w-full max-w-xl mx-auto px-4 py-10">
      <FadeIn>
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight">{t.home.tagline}</h1>
          <p className="text-sm text-zinc-700 dark:text-zinc-400">
            {t.home?.subline || "Takes 6 minutes. No signup."}
          </p>
          <p className="text-sm text-zinc-700 dark:text-zinc-400">
            {t.home?.features || "WCAG AA · Privacy‑first · Offline‑ready"}
          </p>
        </div>
      </FadeIn>
      <FadeIn delay={0.05}>
        <div className="mt-8 grid grid-cols-1 gap-3">
          <Link
            href="/interview"
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-700 p-4 text-center hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-black dark:hover:bg-white transition-colors"
          >
            {t.home.check}
          </Link>
          <Link
            href="/learn"
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 text-center text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            {t.home.learn}
          </Link>
          <Link
            href="/directory"
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 text-center text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            {t.home.support}
          </Link>
        </div>
      </FadeIn>
      <FadeIn delay={0.1}>
        <div className="mt-8">
          <NewsletterSignup variant="default" />
        </div>
      </FadeIn>
    </div>
  );
}
