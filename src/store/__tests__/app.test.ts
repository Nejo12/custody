import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAppStore } from '../app';
import type { Entry } from '../app';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Setup matchMedia mock before importing store
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: query === '(prefers-color-scheme: dark)',
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('useAppStore', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    document.documentElement.className = '';
    // Reset store state
    useAppStore.setState({
      locale: 'en',
      theme: 'system',
      resolvedTheme: 'light',
      interview: { version: '2025-01-01', answers: {} },
      vault: { entries: [] },
    });
  });

  describe('Locale', () => {
    it('defaults to en locale', () => {
      const locale = useAppStore.getState().locale;
      expect(locale).toBe('en');
    });

    it('sets locale correctly', () => {
      useAppStore.getState().setLocale('de');
      expect(useAppStore.getState().locale).toBe('de');
    });

    it('supports all locales', () => {
      const locales: Array<'en' | 'de' | 'ar' | 'pl' | 'fr' | 'tr' | 'ru'> = ['en', 'de', 'ar', 'pl', 'fr', 'tr', 'ru'];
      locales.forEach((locale) => {
        useAppStore.getState().setLocale(locale);
        expect(useAppStore.getState().locale).toBe(locale);
      });
    });
  });

  describe('Theme', () => {
    it('defaults to system theme', () => {
      const theme = useAppStore.getState().theme;
      expect(theme).toBe('system');
    });

    it('sets theme correctly', () => {
      useAppStore.getState().setTheme('dark');
      expect(useAppStore.getState().theme).toBe('dark');
    });

    it('computes resolved theme for light', () => {
      useAppStore.getState().setTheme('light');
      useAppStore.getState().updateResolvedTheme();
      expect(useAppStore.getState().resolvedTheme).toBe('light');
    });

    it('computes resolved theme for dark', () => {
      useAppStore.getState().setTheme('dark');
      useAppStore.getState().updateResolvedTheme();
      expect(useAppStore.getState().resolvedTheme).toBe('dark');
    });

    it('computes resolved theme from system preference', () => {
      useAppStore.getState().setTheme('system');
      useAppStore.getState().updateResolvedTheme();
      const resolved = useAppStore.getState().resolvedTheme;
      expect(['light', 'dark']).toContain(resolved);
    });

    it('updates document class when theme changes', () => {
      useAppStore.getState().setTheme('dark');
      useAppStore.getState().updateResolvedTheme();
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  describe('Interview', () => {
    it('initializes with empty answers', () => {
      const interview = useAppStore.getState().interview;
      expect(interview.answers).toEqual({});
      expect(interview.version).toBe('2025-01-01');
    });

    it('sets answer correctly', () => {
      useAppStore.getState().setAnswer('married_at_birth', 'yes');
      const answers = useAppStore.getState().interview.answers;
      expect(answers.married_at_birth).toBe('yes');
    });

    it('updates existing answer', () => {
      useAppStore.getState().setAnswer('married_at_birth', 'yes');
      useAppStore.getState().setAnswer('married_at_birth', 'no');
      const answers = useAppStore.getState().interview.answers;
      expect(answers.married_at_birth).toBe('no');
    });

    it('sets multiple answers', () => {
      useAppStore.getState().setAnswer('question1', 'yes');
      useAppStore.getState().setAnswer('question2', 'no');
      const answers = useAppStore.getState().interview.answers;
      expect(answers.question1).toBe('yes');
      expect(answers.question2).toBe('no');
    });

    it('resets interview correctly', () => {
      useAppStore.getState().setAnswer('question1', 'yes');
      useAppStore.getState().resetInterview();
      const interview = useAppStore.getState().interview;
      expect(interview.answers).toEqual({});
      expect(interview.version).toBe('2025-01-01');
    });
  });

  describe('Vault', () => {
    it('initializes with empty entries', () => {
      const vault = useAppStore.getState().vault;
      expect(vault.entries).toEqual([]);
    });

    it('adds entry correctly', () => {
      const entry: Entry = {
        id: 'test-id',
        type: 'note',
        title: 'Test Note',
        timestamp: Date.now(),
        payload: {},
      };
      useAppStore.getState().addEntry(entry);
      const entries = useAppStore.getState().vault.entries;
      expect(entries).toHaveLength(1);
      expect(entries[0]).toEqual(entry);
    });

    it('adds multiple entries', () => {
      const entry1: Entry = {
        id: 'id1',
        type: 'note',
        title: 'Note 1',
        timestamp: Date.now(),
        payload: {},
      };
      const entry2: Entry = {
        id: 'id2',
        type: 'file',
        title: 'File 1',
        timestamp: Date.now(),
        payload: { type: 'pdf' },
      };
      useAppStore.getState().addEntry(entry1);
      useAppStore.getState().addEntry(entry2);
      const entries = useAppStore.getState().vault.entries;
      expect(entries).toHaveLength(2);
      expect(entries[0]).toEqual(entry2); // Newest first
    });

    it('removes entry correctly', () => {
      const entry: Entry = {
        id: 'test-id',
        type: 'note',
        title: 'Test Note',
        timestamp: Date.now(),
        payload: {},
      };
      useAppStore.getState().addEntry(entry);
      useAppStore.getState().removeEntry('test-id');
      const entries = useAppStore.getState().vault.entries;
      expect(entries).toHaveLength(0);
    });

    it('removes correct entry when multiple exist', () => {
      const entry1: Entry = { id: 'id1', type: 'note', title: 'Note 1', timestamp: Date.now(), payload: {} };
      const entry2: Entry = { id: 'id2', type: 'file', title: 'File 1', timestamp: Date.now(), payload: {} };
      useAppStore.getState().addEntry(entry1);
      useAppStore.getState().addEntry(entry2);
      useAppStore.getState().removeEntry('id1');
      const entries = useAppStore.getState().vault.entries;
      expect(entries).toHaveLength(1);
      expect(entries[0].id).toBe('id2');
    });
  });

  describe('Export Data', () => {
    it('exports data correctly', () => {
      useAppStore.getState().setLocale('de');
      useAppStore.getState().setTheme('dark');
      useAppStore.getState().setAnswer('question1', 'yes');
      const entry: Entry = { id: 'id1', type: 'note', title: 'Note', timestamp: 123456, payload: {} };
      useAppStore.getState().addEntry(entry);

      const exported = useAppStore.getState().exportData();
      const parsed = JSON.parse(exported);

      expect(parsed.locale).toBe('de');
      expect(parsed.theme).toBe('dark');
      expect(parsed.interview.answers.question1).toBe('yes');
      expect(parsed.vault.entries).toHaveLength(1);
    });

    it('exports empty state correctly', () => {
      const exported = useAppStore.getState().exportData();
      const parsed = JSON.parse(exported);
      expect(parsed.locale).toBeDefined();
      expect(parsed.interview).toBeDefined();
      expect(parsed.vault).toBeDefined();
    });
  });
});

