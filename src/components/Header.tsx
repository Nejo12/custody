"use client";
import Link from 'next/link';
import LanguageSwitch from './LanguageSwitch';
import { useI18n } from '@/i18n';

export default function Header() {
  const { t } = useI18n();
  return (
    <header className="w-full max-w-xl mx-auto flex items-center justify-between py-4 px-4">
      <Link href="/" className="font-semibold tracking-tight text-lg">
        {t.appName}
      </Link>
      <div className="flex items-center gap-3">
        <Link href="/settings" className="text-sm underline decoration-dotted">Settings</Link>
        <LanguageSwitch />
      </div>
    </header>
  );
}

