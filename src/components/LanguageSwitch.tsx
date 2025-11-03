"use client";
import { useI18n } from '@/i18n';
import { useState, useEffect, useRef } from 'react';

type Locale = 'en'|'de'|'ar'|'pl'|'fr'|'tr'|'ru';
const locales: Array<{ code: Locale; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ar', label: 'العربية' },
  { code: 'pl', label: 'Polski' },
  { code: 'fr', label: 'Français' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'ru', label: 'Русский' },
];

export default function LanguageSwitch() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const active = locales.find(l => l.code === (locale as Locale));

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative text-sm">
      <button
        className="rounded-full border px-3 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-200 hover:text-black dark:hover:text-black"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        title="Change language"
      >
        {active?.label || (locale.toUpperCase())}
      </button>
      {open && (
        <ul role="listbox" className="absolute right-0 mt-1 w-44 rounded-lg border bg-white shadow-md dark:bg-zinc-900 dark:border-zinc-700 z-50">
          {locales.map(l => (
            <li key={l.code} role="option" aria-selected={locale===l.code}>
              <button
                onClick={() => { setLocale(l.code); setOpen(false); }}
                className={`w-full text-left px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 ${locale===l.code?'font-medium':''}`}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
