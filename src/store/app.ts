"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Entry = {
  id: string;
  type: "note" | "file" | "payment";
  title: string;
  timestamp: number;
  payload: Record<string, unknown>;
};

export type InterviewState = {
  version: string;
  answers: Record<string, string>;
};

type AppState = {
  locale: "en" | "de" | "ar" | "pl" | "fr" | "tr" | "ru";
  setLocale: (l: "en" | "de" | "ar" | "pl" | "fr" | "tr" | "ru") => void;

  theme: "light" | "dark" | "system";
  setTheme: (t: "light" | "dark" | "system") => void;
  resolvedTheme: "light" | "dark";
  updateResolvedTheme: () => void;

  interview: InterviewState;
  setAnswer: (key: string, value: string) => void;
  resetInterview: () => void;

  vault: { entries: Entry[] };
  addEntry: (e: Entry) => void;
  removeEntry: (id: string) => void;
  exportData: () => string;

  preferredCity: "berlin" | "hamburg" | "nrw";
  setPreferredCity: (c: "berlin" | "hamburg" | "nrw") => void;
};

const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => {
      const getInitialTheme = (): "light" | "dark" | "system" => {
        if (typeof window === "undefined") return "system";
        return (localStorage.getItem("theme") as "light" | "dark" | "system") || "system";
      };

      const computeResolvedTheme = (theme: "light" | "dark" | "system"): "light" | "dark" => {
        return theme === "system" ? getSystemTheme() : theme;
      };

      const initialTheme = getInitialTheme();
      const initialResolvedTheme = computeResolvedTheme(initialTheme);

      return {
        locale:
          (typeof window !== "undefined" &&
            (localStorage.getItem("locale") as AppState["locale"])) ||
          "en",
        setLocale: (l) => set({ locale: l }),
        preferredCity:
          (typeof window !== "undefined" &&
            (localStorage.getItem("preferredCity") as AppState["preferredCity"])) ||
          "berlin",
        setPreferredCity: (c) => set({ preferredCity: c }),
        theme: initialTheme,
        setTheme: (t) => {
          set({ theme: t });
          get().updateResolvedTheme();
        },
        resolvedTheme: initialResolvedTheme,
        updateResolvedTheme: () => {
          const theme = get().theme;
          const resolved = computeResolvedTheme(theme);
          set({ resolvedTheme: resolved });
          if (typeof window !== "undefined") {
            const html = document.documentElement;
            html.classList.remove("light", "dark");
            html.classList.add(resolved);
          }
        },
        interview: {
          version: "2025-01-01",
          answers: {},
        },
        setAnswer: (key, value) =>
          set((s) => ({
            interview: { ...s.interview, answers: { ...s.interview.answers, [key]: value } },
          })),
        resetInterview: () => set({ interview: { version: "2025-01-01", answers: {} } }),
        vault: { entries: [] },
        addEntry: (e) => set((s) => ({ vault: { entries: [e, ...s.vault.entries] } })),
        removeEntry: (id) =>
          set((s) => ({ vault: { entries: s.vault.entries.filter((e) => e.id !== id) } })),
        exportData: () => {
          const data = {
            locale: get().locale,
            theme: get().theme,
            preferredCity: get().preferredCity,
            interview: get().interview,
            vault: get().vault,
          };
          return JSON.stringify(data, null, 2);
        },
      };
    },
    {
      name: "custody-clarity",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        locale: s.locale,
        theme: s.theme,
        preferredCity: s.preferredCity,
        interview: s.interview,
        vault: s.vault,
      }),
    }
  )
);
