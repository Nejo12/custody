"use client";

import { useTheme } from "next-themes";
import { useState, useLayoutEffect, type JSX } from "react";
import { useI18n } from "@/i18n";

/**
 * ThemeSwitch Component
 *
 * A button that toggles between light, dark, and system themes.
 * Displays an appropriate icon based on the current theme setting.
 *
 * Theme cycle: light → dark → system → light
 *
 * Features:
 * - Visual icons for each theme state (sun, moon, computer)
 * - Accessible labels and screen reader support
 * - Smooth transitions between theme states
 * - Properly handles mounted state to prevent hydration errors
 */
export default function ThemeSwitch() {
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
        className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
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
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
      aria-label={getLabel()}
      title={getLabel()}
      type="button"
    >
      <span className="sr-only">{getLabel()}</span>
      <span className="text-zinc-700 dark:text-zinc-500 transition-transform duration-200 hover:scale-110">
        {getIcon()}
      </span>
    </button>
  );
}
