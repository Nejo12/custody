"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import enDict from "./en";
import de from "./de";
import ar from "./ar";
import pl from "./pl";
import fr from "./fr";
import tr from "./tr";
import ru from "./ru";
import type { TranslationDict } from "@/types";

type Locale = "en" | "de" | "ar" | "pl" | "fr" | "tr" | "ru";
// Use TranslationDict type - some locales may have incomplete question sets
// but the common structure is preserved
type Dict = TranslationDict;

// Type assertion needed because some locales have partial question sets
// This is acceptable since the app handles missing properties gracefully
const dictionaries: Record<Locale, Dict> = { en: enDict, de, ar, pl, fr, tr, ru } as Record<
  Locale,
  Dict
>;

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
  // Always start with "en" to avoid hydration mismatch
  const [locale, setLocaleState] = useState<Locale>("en");
  const hasInitialized = useRef(false);

  // Load locale from localStorage after mount (client-side only)
  // Using useLayoutEffect to avoid hydration mismatch
  // This is necessary for Next.js hydration - we must load from localStorage after mount
  useLayoutEffect(() => {
    if (!hasInitialized.current && typeof window !== "undefined") {
      hasInitialized.current = true;
      const savedLocale = (localStorage.getItem("locale") as Locale) || "en";
      if (savedLocale !== "en") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocaleState(savedLocale);
      }
    }
  }, []); // Only run once on mount

  // Update locale and sync to localStorage/DOM
  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem("locale", newLocale);
    }
  };

  // Sync locale to DOM attributes
  useEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    document.title = appNames[locale];
  }, [locale]);

  const value = useMemo(() => ({ locale, t: dictionaries[locale], setLocale }), [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
