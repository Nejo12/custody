"use client";
import { useI18n } from '@/i18n';

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="w-full max-w-xl mx-auto text-center text-xs text-zinc-500 py-6 px-4">
      <p>{t.home.disclaimer}</p>
    </footer>
  );
}

