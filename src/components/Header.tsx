"use client";
import Link from "next/link";
import LanguageSwitch from "./LanguageSwitch";
import { useI18n } from "@/i18n";
import { useInstallPrompt } from "./useInstallPrompt";
import CitySwitch from "./CitySwitch";
import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/app";

export default function Header({ onOpenHelp }: { onOpenHelp?: () => void }) {
  const { t } = useI18n();
  const { canInstall, promptInstall } = useInstallPrompt();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { safetyMode, discreetMode } = useAppStore();

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  // Quick Exit keyboard shortcut when Safety Mode enabled (Shift+Escape)
  useEffect(() => {
    if (!safetyMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && e.shiftKey) {
        if (typeof window !== "undefined") window.location.replace("https://www.google.com");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [safetyMode]);

  return (
    <header className="sticky top-0 z-40 w-full header-surface">
      <div className="max-w-xl mx-auto px-4">
        <div className="h-14 flex items-center justify-between gap-2 min-w-0">
          <Link
            href="/"
            className="font-semibold tracking-tight text-base sm:text-lg whitespace-nowrap truncate flex-shrink-0"
          >
            {discreetMode ? "Notes" : t.appName}
          </Link>
          {/* Right actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
              onClick={() => onOpenHelp?.()}
              title={t.header?.findHelp ?? "Need help?"}
              aria-label={t.header?.findHelp ?? "Need help?"}
            >
              <svg
                className="w-4 h-4 text-zinc-700 dark:text-zinc-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
            <button
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
              onClick={() => {
                if (typeof window !== "undefined")
                  window.location.replace("https://www.google.com");
              }}
              title={t.header?.quickExit || "Quick Exit"}
              aria-label={t.header?.quickExit || "Quick Exit"}
            >
              <svg
                className="w-4 h-4 text-zinc-700 dark:text-zinc-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <CitySwitch />
              <LanguageSwitch />
              <Link
                href="/settings"
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
                title={t.header?.settings || "Settings"}
                aria-label={t.header?.settings || "Settings"}
              >
                <svg
                  className="w-4 h-4 text-zinc-700 dark:text-zinc-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </Link>
              {canInstall && (
                <button
                  className="btn-pill"
                  onClick={() => void promptInstall()}
                  title={t.header?.installApp || "Install App"}
                >
                  {t.header?.installApp || "Install App"}
                </button>
              )}
            </div>
            {/* Mobile menu */}
            <div className="relative sm:hidden" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="btn-pill"
              >
                {t.header?.more || "More"}
              </button>
              {menuOpen && (
                <div
                  role="menu"
                  className="menu-panel fixed right-0 mt-2 w-56 rounded-xl border bg-white dark:bg-zinc-900 shadow-xl p-2 z-50 divide-y divide-zinc-200 dark:divide-zinc-800"
                >
                  <button
                    className="w-full h-9 text-left rounded-md px-3 text-sm text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenHelp?.();
                    }}
                  >
                    {t.header?.findHelp ?? "Need help?"}
                  </button>
                  {canInstall && (
                    <button
                      className="w-full h-9 text-left rounded-md px-3 text-sm text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      onClick={() => {
                        setMenuOpen(false);
                        void promptInstall();
                      }}
                    >
                      {t.header?.installApp || "Install App"}
                    </button>
                  )}
                  <Link
                    href="/settings"
                    className="block h-9 rounded-md px-3 text-sm text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t.header?.settings || "Settings"}
                  </Link>
                  <div className="pt-2" />
                  <div className="px-1 py-2 space-y-2">
                    <CitySwitch buttonClassName="btn-pill w-full justify-start" />
                    <LanguageSwitch buttonClassName="btn-pill w-full justify-start" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
