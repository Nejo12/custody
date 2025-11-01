"use client";
import { useI18n } from '@/i18n';

export default function SettingsPage() {
  const { t, locale, setLocale } = useI18n();
  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-xl font-semibold">{t.settings.title}</h1>

      <div className="space-y-2">
        <div className="text-sm text-zinc-500">{t.settings.language}</div>
        <div className="inline-flex rounded-full border overflow-hidden">
          <button onClick={() => setLocale('en')} className={`px-4 py-2 ${locale==='en'?'bg-black text-white':'bg-white'}`}>EN</button>
          <button onClick={() => setLocale('de')} className={`px-4 py-2 ${locale==='de'?'bg-black text-white':'bg-white'}`}>DE</button>
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-sm text-zinc-500">{t.settings.about}</div>
        <p className="text-sm text-zinc-700">Privacy-first, offline-capable prototype. Information only, not individualized legal advice.</p>
      </div>
    </div>
  );
}

