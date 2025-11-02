"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import en from "./en";
import de from "./de";
import ar from "./ar";
import pl from "./pl";
import fr from "./fr";
import tr from "./tr";
import ru from "./ru";

type Locale = "en" | "de" | "ar" | "pl" | "fr" | "tr" | "ru";
type Dict = typeof en;

const dictionaries: Record<Locale, Dict> = { en, de, ar, pl, fr, tr, ru };

const appNames: Record<Locale, string> = {
  en: "Custody Clarity",
  de: "ElternWeg",
  ar: "وضوح الحضانة",
  pl: "Jasność Opieki",
  fr: "Clarté de la Garde",
  tr: "Vesayet Netliği",
  ru: "Ясность Опеки",
};

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
      document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
      document.title = appNames[locale];
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

