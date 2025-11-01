"use client";
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Entry = {
  id: string;
  type: 'note' | 'file' | 'payment';
  title: string;
  timestamp: number;
  payload: Record<string, unknown>;
};

export type InterviewState = {
  version: string;
  answers: Record<string, string>;
};

type AppState = {
  locale: 'en' | 'de';
  setLocale: (l: 'en' | 'de') => void;

  interview: InterviewState;
  setAnswer: (key: string, value: string) => void;
  resetInterview: () => void;

  vault: { entries: Entry[] };
  addEntry: (e: Entry) => void;
  removeEntry: (id: string) => void;
  exportData: () => string;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      locale: (typeof window !== 'undefined' && (localStorage.getItem('locale') as 'en' | 'de')) || 'en',
      setLocale: (l) => set({ locale: l }),
      interview: {
        version: '2025-01-01',
        answers: {},
      },
      setAnswer: (key, value) => set((s) => ({
        interview: { ...s.interview, answers: { ...s.interview.answers, [key]: value } },
      })),
      resetInterview: () => set({ interview: { version: '2025-01-01', answers: {} } }),
      vault: { entries: [] },
      addEntry: (e) => set((s) => ({ vault: { entries: [e, ...s.vault.entries] } })),
      removeEntry: (id) => set((s) => ({ vault: { entries: s.vault.entries.filter((e) => e.id !== id) } })),
      exportData: () => {
        const data = {
          locale: get().locale,
          interview: get().interview,
          vault: get().vault,
        };
        return JSON.stringify(data, null, 2);
      },
    }),
    {
      name: 'custody-clarity',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ locale: s.locale, interview: s.interview, vault: s.vault }),
    }
  )
);

