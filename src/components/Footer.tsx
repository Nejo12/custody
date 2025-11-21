"use client";
import Link from "next/link";
import { useI18n } from "@/i18n";

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="w-full max-w-6xl mx-auto text-center text-sm text-zinc-700 dark:text-zinc-400 py-8 px-4 space-y-3">
      <p className="text-base font-medium text-zinc-800 dark:text-zinc-200">
        {t.home?.disclaimer || "Information only. Not individualized legal advice."}
      </p>
      <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2">
        <Link
          href="/planning"
          className="underline hover:text-zinc-700 dark:hover:text-zinc-600 transition-colors"
        >
          {t.footer?.planning || "Planning"}
        </Link>
        <Link
          href="/guides"
          className="underline hover:text-zinc-700 dark:hover:text-zinc-600 transition-colors"
        >
          {t.footer?.guides || "Guides"}
        </Link>
        <Link
          href="/blog"
          className="underline hover:text-zinc-700 dark:hover:text-zinc-600 transition-colors"
        >
          {t.footer?.blog || "Blog"}
        </Link>
        <Link
          href="/pricing"
          className="underline hover:text-zinc-700 dark:hover:text-zinc-600 transition-colors"
        >
          {"Pro Documents"}
        </Link>
        <Link
          href="/impressum"
          className="underline hover:text-zinc-700 dark:hover:text-zinc-600 transition-colors"
        >
          {t.footer?.impressum || "Impressum"}
        </Link>
        <Link
          href="/datenschutz"
          className="underline hover:text-zinc-700 dark:hover:text-zinc-600 transition-colors"
        >
          {t.footer?.datenschutz || "Datenschutz"}
        </Link>
      </nav>
    </footer>
  );
}
