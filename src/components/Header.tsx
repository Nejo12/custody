"use client";
import Link from 'next/link';
import LanguageSwitch from './LanguageSwitch';
import ThemeSwitch from './ThemeSwitch';
import { useI18n } from '@/i18n';
import { useInstallPrompt } from './useInstallPrompt';

export default function Header() {
  const { t } = useI18n();
  const { canInstall, promptInstall } = useInstallPrompt();
  return (
    <header className="w-full max-w-xl mx-auto flex items-center justify-between py-4 px-4">
      <Link href="/" className="font-semibold tracking-tight text-lg">
        {t.appName}
      </Link>
      <div className="flex items-center gap-3">
        {canInstall && (
          <button
            className="text-sm underline decoration-dotted hover:bg-zinc-50 dark:hover:bg-zinc-200 hover:text-black dark:hover:text-black rounded px-2 py-1"
            onClick={() => { void promptInstall(); }}
            title="Installable on supported mobile browsers"
          >
            Install App
          </button>
        )}
        <Link href="/settings" className="text-sm underline decoration-dotted">Settings</Link>
        <ThemeSwitch />
        <LanguageSwitch />
      </div>
    </header>
  );
}
