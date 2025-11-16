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

/**
 * Application State Type Definition
 *
 * Defines the shape of the global application state managed by Zustand.
 * Theme management is handled separately by next-themes.
 */
type AppState = {
  // Locale/Language settings
  locale: "en" | "de" | "ar" | "pl" | "fr" | "tr" | "ru";
  setLocale: (l: "en" | "de" | "ar" | "pl" | "fr" | "tr" | "ru") => void;

  // Interview state
  interview: InterviewState;
  setAnswer: (key: string, value: string) => void;
  resetInterview: () => void;

  // Vault/Document storage
  vault: { entries: Entry[] };
  addEntry: (e: Entry) => void;
  removeEntry: (id: string) => void;
  exportData: () => string;

  // User preferences
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

  // Safety & privacy
  safetyMode: boolean;
  setSafetyMode: (v: boolean) => void;
  discreetMode: boolean;
  setDiscreetMode: (v: boolean) => void;
  blurThumbnails: boolean;
  setBlurThumbnails: (v: boolean) => void;

  // Milestones tracking
  milestones: {
    answeredCore: boolean;
    courtSelected: boolean;
    senderSelected: boolean;
    pdfGenerated: boolean;
    lastUpdated?: number;
  };
  setMilestone: (key: keyof AppState["milestones"], value: boolean) => void;

  // Disclaimer acknowledgment
  disclaimerAcknowledged: boolean;
  disclaimerAcknowledgedTimestamp?: number;
  setDisclaimerAcknowledged: (value: boolean) => void;

  // Data management
  wipeAll: () => void;
};

/**
 * Zustand Store for Application State
 *
 * Manages global application state with persistence to localStorage.
 * Theme management is intentionally excluded and handled by next-themes.
 */
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => {
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
        safetyMode: false,
        setSafetyMode: (v) => set({ safetyMode: v }),
        discreetMode: false,
        setDiscreetMode: (v) => set({ discreetMode: v }),
        blurThumbnails: false,
        setBlurThumbnails: (v) => set({ blurThumbnails: v }),
        milestones: {
          answeredCore: false,
          courtSelected: false,
          senderSelected: false,
          pdfGenerated: false,
        },
        setMilestone: (key, value) =>
          set((s) => ({ milestones: { ...s.milestones, [key]: value, lastUpdated: Date.now() } })),
        disclaimerAcknowledged: false,
        disclaimerAcknowledgedTimestamp: undefined,
        setDisclaimerAcknowledged: (value) =>
          set({ disclaimerAcknowledged: value, disclaimerAcknowledgedTimestamp: Date.now() }),
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
            // Silently fail if localStorage is not available
          }
          // Reset in‑memory state to initial defaults
          set({
            locale: "en",
            preferredCity: "berlin",
            preferredCourtTemplate: "",
            includeTimelineInPack: false,
            preferredOcrNoteId: "",
            socialWorkerMode: false,
            safetyMode: false,
            discreetMode: false,
            blurThumbnails: false,
            milestones: {
              answeredCore: false,
              courtSelected: false,
              senderSelected: false,
              pdfGenerated: false,
              lastUpdated: Date.now(),
            },
            disclaimerAcknowledged: false,
            disclaimerAcknowledgedTimestamp: undefined,
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
        preferredCity: s.preferredCity,
        preferredCourtTemplate: s.preferredCourtTemplate,
        includeTimelineInPack: s.includeTimelineInPack,
        preferredOcrNoteId: s.preferredOcrNoteId,
        socialWorkerMode: s.socialWorkerMode,
        safetyMode: s.safetyMode,
        discreetMode: s.discreetMode,
        blurThumbnails: s.blurThumbnails,
        milestones: s.milestones,
        disclaimerAcknowledged: s.disclaimerAcknowledged,
        disclaimerAcknowledgedTimestamp: s.disclaimerAcknowledgedTimestamp,
        interview: s.interview,
        vault: s.vault,
      }),
    }
  )
);
