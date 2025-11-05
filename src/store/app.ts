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
  preferredCourtTemplate?: string;
  setPreferredCourtTemplate: (tpl: string) => void;
  includeTimelineInPack: boolean;
  setIncludeTimelineInPack: (v: boolean) => void;
  preferredOcrNoteId?: string;
  setPreferredOcrNoteId: (id: string) => void;
  socialWorkerMode: boolean;
  setSocialWorkerMode: (v: boolean) => void;
  milestones: {
    answeredCore: boolean;
    courtSelected: boolean;
    senderSelected: boolean;
    pdfGenerated: boolean;
    lastUpdated?: number;
  };
  setMilestone: (key: keyof AppState["milestones"], value: boolean) => void;
  wipeAll: () => void;
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
        // Persist middleware will rehydrate preferredCourtTemplate; default to empty string
        preferredCourtTemplate: "",
        setPreferredCourtTemplate: (tpl) => set({ preferredCourtTemplate: tpl }),
        // Persist middleware will rehydrate includeTimelineInPack; default to false
        includeTimelineInPack: false,
        setIncludeTimelineInPack: (v) => set({ includeTimelineInPack: v }),
        preferredOcrNoteId: "",
        setPreferredOcrNoteId: (id) => set({ preferredOcrNoteId: id }),
        socialWorkerMode: false,
        setSocialWorkerMode: (v) => set({ socialWorkerMode: v }),
        milestones: {
          answeredCore: false,
          courtSelected: false,
          senderSelected: false,
          pdfGenerated: false,
        },
        setMilestone: (key, value) =>
          set((s) => ({ milestones: { ...s.milestones, [key]: value, lastUpdated: Date.now() } })),
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
            preferredCourtTemplate: get().preferredCourtTemplate,
            includeTimelineInPack: get().includeTimelineInPack,
            interview: get().interview,
            vault: get().vault,
          };
          return JSON.stringify(data, null, 2);
        },
        wipeAll: () => {
          try {
            // Clear persisted storage
            if (typeof localStorage !== "undefined") {
              localStorage.removeItem("custody-clarity");
            }
          } catch {
            // ignore
          }
          // Reset in‑memory state to initial defaults
          set({
            locale: "en",
            theme: initialTheme,
            resolvedTheme: initialResolvedTheme,
            preferredCity: "berlin",
            preferredCourtTemplate: "",
            includeTimelineInPack: false,
            preferredOcrNoteId: "",
            socialWorkerMode: false,
            milestones: {
              answeredCore: false,
              courtSelected: false,
              senderSelected: false,
              pdfGenerated: false,
              lastUpdated: Date.now(),
            },
            interview: { version: "2025-01-01", answers: {} },
            vault: { entries: [] },
          });
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
        preferredCourtTemplate: s.preferredCourtTemplate,
        includeTimelineInPack: s.includeTimelineInPack,
        preferredOcrNoteId: s.preferredOcrNoteId,
        socialWorkerMode: s.socialWorkerMode,
        milestones: s.milestones,
        interview: s.interview,
        vault: s.vault,
      }),
    }
  )
);
