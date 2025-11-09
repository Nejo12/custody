"use client";
import { useI18n } from "@/i18n";

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="w-full max-w-xl mx-auto text-center text-xs text-zinc-700 dark:text-zinc-400 py-6 px-4 space-y-2">
      <p>{t.home.disclaimer}</p>
      <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        <a
          href="/impressum"
          className="underline hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          Impressum
        </a>
        <a
          href="/datenschutz"
          className="underline hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          Datenschutz
        </a>
      </nav>
    </footer>
  );
}
