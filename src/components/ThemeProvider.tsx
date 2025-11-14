"use client";

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";

/**
 * ThemeProvider Component
 *
 * Wraps the next-themes ThemeProvider to provide theme management across the application.
 * This component handles:
 * - Light, dark, and system theme preferences
 * - Theme persistence in localStorage
 * - Prevention of flash of unstyled content (FOUC) on page load
 * - Automatic sync with system preferences when theme is set to "system"
 *
 * @param children - React children to be wrapped by the provider
 * @param props - Additional props passed to next-themes ThemeProvider
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
