"use client";
import Link from "next/link";
import { useI18n } from "@/i18n";
import FadeIn from "@/components/FadeIn";

export default function Home() {
  const { t } = useI18n();
  return (
    <div className="w-full max-w-xl mx-auto px-4 py-10">
      <FadeIn>
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight">{t.home.tagline}</h1>
          <p className="text-sm text-zinc-700 dark:text-zinc-400">
            WCAG AA · Privacy‑first · Offline‑ready
          </p>
        </div>
      </FadeIn>
      <FadeIn delay={0.05}>
        <div className="mt-8 grid grid-cols-1 gap-3">
          <Link
            href="/interview"
            className="rounded-lg border p-4 text-center hover:bg-zinc-50 dark:hover:bg-zinc-200 hover:text-black dark:hover:text-black"
          >
            {t.home.check}
          </Link>
          <Link
            href="/learn"
            className="rounded-lg border p-4 text-center hover:bg-zinc-50 dark:hover:bg-zinc-200 hover:text-black dark:hover:text-black"
          >
            {t.home.learn}
          </Link>
          <Link
            href="/directory"
            className="rounded-lg border p-4 text-center hover:bg-zinc-50 dark:hover:bg-zinc-200 hover:text-black dark:hover:text-black"
          >
            {t.home.support}
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
