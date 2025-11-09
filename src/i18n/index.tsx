"use client";
import React, {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import enDict from "./en";
import type { TranslationDict } from "@/types";

type Locale = "en" | "de" | "ar" | "pl" | "fr" | "tr" | "ru";
// Use TranslationDict type - some locales may have incomplete question sets
// but the common structure is preserved
type Dict = TranslationDict;

// Lazy load locale dictionaries - only load current locale
const loadLocale = async (locale: Locale): Promise<Dict> => {
  switch (locale) {
    case "en":
      return enDict;
    case "de":
      return (await import("./de")).default as Dict;
    case "ar":
      return (await import("./ar")).default as Dict;
    case "pl":
      return (await import("./pl")).default as Dict;
    case "fr":
      return (await import("./fr")).default as Dict;
    case "tr":
      return (await import("./tr")).default as Dict;
    case "ru":
      return (await import("./ru")).default as Dict;
    default:
      return enDict;
  }
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
  const [dict, setDict] = useState<Dict>(enDict);
  const hasInitialized = useRef(false);
  const isMountedRef = useRef(true);

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

  // Track mount status to prevent state updates after unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Lazy load dictionary when locale changes
  useEffect(() => {
    startTransition(() => {
      if (locale === "en") {
        setDict(enDict);
        return;
      }
      loadLocale(locale)
        .then((loadedDict) => {
          if (isMountedRef.current) {
            setDict(loadedDict);
          }
        })
        .catch(() => {
          if (isMountedRef.current) {
            setDict(enDict);
          }
        });
    });
  }, [locale]);

  // Update document attributes when locale changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Set document lang
    document.documentElement.lang = locale;

    // Set document dir for RTL languages
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";

    // Set document title
    document.title = dict.appName || "";
  }, [locale, dict.appName]);

  // Custom setLocale that persists to localStorage
  const setLocale = React.useCallback((newLocale: Locale) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("locale", newLocale);
    }
    setLocaleState(newLocale);
  }, []);

  const value = useMemo(() => ({ locale, t: dict, setLocale }), [locale, dict, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
