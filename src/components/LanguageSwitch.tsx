"use client";
import { useI18n } from "@/i18n";
import { useState, useEffect, useRef } from "react";

type Locale = "en" | "de" | "ar" | "pl" | "fr" | "tr" | "ru";
const locales: Array<{ code: Locale; label: string; shortCode: string }> = [
  { code: "en", label: "English", shortCode: "En" },
  { code: "de", label: "Deutsch", shortCode: "De" },
  { code: "ar", label: "العربية", shortCode: "Ar" },
  { code: "pl", label: "Polski", shortCode: "Pl" },
  { code: "fr", label: "Français", shortCode: "Fr" },
  { code: "tr", label: "Türkçe", shortCode: "Tr" },
  { code: "ru", label: "Русский", shortCode: "Ru" },
];

export default function LanguageSwitch({ buttonClassName }: { buttonClassName?: string }) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const active = locales.find((l) => l.code === (locale as Locale));

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative text-sm">
      <button
        className={
          buttonClassName ||
          "inline-flex items-center justify-center w-10 h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
        }
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Change language. Current: ${active?.label || locale}`}
        onClick={() => setOpen((v) => !v)}
        title={active ? `${active.label} (${active.shortCode})` : "Change language"}
      >
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {active?.shortCode || locale.toUpperCase().slice(0, 2)}
        </span>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 mt-1 w-44 rounded-lg border bg-white shadow-md dark:bg-zinc-900 dark:border-zinc-700 z-50 text-zinc-900 dark:text-zinc-100 overflow-hidden"
        >
          {locales.map((l) => (
            <li
              key={l.code}
              role="option"
              aria-selected={locale === l.code}
              className={locale === l.code ? "bg-zinc-50 dark:bg-zinc-800" : ""}
            >
              <button
                onClick={() => {
                  setLocale(l.code);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 ${locale === l.code ? "font-medium" : ""}`}
                aria-label={`Select ${l.label}`}
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
