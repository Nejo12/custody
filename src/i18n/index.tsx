"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import en from "./en";
import de from "./de";

type Locale = "en" | "de";
type Dict = typeof en;

const dictionaries: Record<Locale, Dict> = { en, de };

type I18nContextType = {
  locale: Locale;
  t: Dict;
  setLocale: (l: Locale) => void;
};

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === "undefined") return "en";
    return (localStorage.getItem("locale") as Locale) || "en";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("locale", locale);
      document.documentElement.lang = locale;
      document.title = locale === "de" ? "ElternWeg" : "Custody Clarity";
    }
  }, [locale]);

  const value = useMemo(
    () => ({ locale, t: dictionaries[locale], setLocale }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

