"use client";

import { useTheme } from "next-themes";
import { useState, useLayoutEffect, type JSX } from "react";
import { useI18n } from "@/i18n";

/**
 * FloatingThemeSwitch Component
 *
 * A floating action button (FAB) that toggles between light, dark, and system themes.
 * Positioned fixed on the page for easy access from anywhere.
 * Displays an appropriate icon based on the current theme setting.
 *
 * Theme cycle: light → dark → system → light
 *
 * Features:
 * - Fixed positioning with responsive placement (bottom on mobile, top on desktop)
 * - Visual icons for each theme state (sun, moon, computer)
 * - Backdrop blur and semi-transparent background
 * - Accessible labels and screen reader support
 * - Smooth transitions and hover effects
 * - Properly handles mounted state to prevent hydration errors
 */
export default function FloatingThemeSwitch() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  // This is intentional to prevent hydration mismatches with next-themes
  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  /**
   * Toggles through theme options in order: light → dark → system → light
   */
  const toggleTheme = (): void => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  /**
   * Returns the appropriate icon based on current theme setting
   * - System: Computer/monitor icon
   * - Dark: Moon icon
   * - Light: Sun icon
   */
  const getIcon = (): JSX.Element => {
    if (theme === "system") {
      return (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      );
    }
    if (resolvedTheme === "dark") {
      return (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      );
    }
    return (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    );
  };

  /**
   * Returns accessible label text for the current theme
   */
  const getLabel = (): string => {
    if (theme === "system") return t.settings.themeSystem;
    return resolvedTheme === "dark" ? t.settings.themeDark : t.settings.themeLight;
  };

  // Prevent rendering until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <button
        className="fixed bottom-12 md:top-[4rem] right-4 z-[60] inline-flex items-center justify-center w-12 h-12 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm shadow-lg"
        aria-label="Loading theme"
        type="button"
        disabled
      >
        <span className="sr-only">Loading theme</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-12 md:top-[4rem] right-4 z-[60] inline-flex items-center justify-center w-12 h-12 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-zinc-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 focus:ring-offset-2 dark:focus:ring-offset-zinc-800 shadow-lg hover:shadow-xl"
      aria-label={getLabel()}
      title={getLabel()}
      type="button"
    >
      <span className="sr-only">{getLabel()}</span>
      <span className="dark:text-zinc-200 transition-transform duration-200 hover:scale-110">
        {getIcon()}
      </span>
    </button>
  );
}
