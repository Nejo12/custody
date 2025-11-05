"use client";
import { useI18n } from "@/i18n";
import { useAppStore } from "@/store/app";

const languages: {
  code: "en" | "de" | "ar" | "pl" | "fr" | "tr" | "ru";
  label: string;
  name: string;
}[] = [
  { code: "en", label: "EN", name: "English" },
  { code: "de", label: "DE", name: "Deutsch" },
  { code: "ar", label: "AR", name: "العربية" },
  { code: "pl", label: "PL", name: "Polski" },
  { code: "fr", label: "FR", name: "Français" },
  { code: "tr", label: "TR", name: "Türkçe" },
  { code: "ru", label: "RU", name: "Русский" },
];

export default function SettingsPage() {
  const { t, locale, setLocale } = useI18n();
  const { socialWorkerMode, setSocialWorkerMode } = useAppStore();
  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-xl font-semibold">{t.settings.title}</h1>

      <div className="space-y-2">
        <div className="text-sm text-zinc-700 dark:text-zinc-400">{t.settings.language}</div>
        <div className="inline-flex flex-wrap gap-2 rounded-full border overflow-hidden">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLocale(lang.code)}
              className={`px-4 py-2 ${locale === lang.code ? "bg-black text-white" : "bg-white"}`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-sm text-zinc-700 dark:text-zinc-400">{t.settings.about}</div>
        <p className="text-sm text-zinc-700">
          Privacy-first, offline-capable prototype. Information only, not individualized legal
          advice.
        </p>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-zinc-700 dark:text-zinc-400">Social Worker Mode</div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={socialWorkerMode}
            onChange={(e) => setSocialWorkerMode(e.target.checked)}
          />
          Enable tools for helpers/NGOs
        </label>
        {socialWorkerMode && (
          <a href="/worker" className="underline text-sm">
            Open Social Worker tools
          </a>
        )}
      </div>
    </div>
  );
}
