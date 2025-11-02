"use client";
import { useI18n } from '@/i18n';

const languages: { code: 'en' | 'de' | 'ar' | 'pl' | 'fr' | 'tr' | 'ru'; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
  { code: 'ar', label: 'AR' },
  { code: 'pl', label: 'PL' },
  { code: 'fr', label: 'FR' },
  { code: 'tr', label: 'TR' },
  { code: 'ru', label: 'RU' },
];

export default function LanguageSwitch() {
  const { locale, setLocale } = useI18n();
  return (
    <div className="inline-flex rounded-full border border-zinc-300 overflow-hidden text-sm">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLocale(lang.code)}
          className={`px-3 py-1 ${locale === lang.code ? 'bg-black text-white' : 'bg-white text-black'}`}
          aria-pressed={locale === lang.code}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}

