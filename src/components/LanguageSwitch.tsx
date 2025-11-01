"use client";
import { useI18n } from '@/i18n';

export default function LanguageSwitch() {
  const { locale, setLocale } = useI18n();
  return (
    <div className="inline-flex rounded-full border border-zinc-300 overflow-hidden text-sm">
      <button
        onClick={() => setLocale('en')}
        className={`px-3 py-1 ${locale === 'en' ? 'bg-black text-white' : 'bg-white text-black'}`}
        aria-pressed={locale === 'en'}
      >
        EN
      </button>
      <button
        onClick={() => setLocale('de')}
        className={`px-3 py-1 ${locale === 'de' ? 'bg-black text-white' : 'bg-white text-black'}`}
        aria-pressed={locale === 'de'}
      >
        DE
      </button>
    </div>
  );
}

