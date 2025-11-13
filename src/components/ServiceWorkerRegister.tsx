"use client";
import { useEffect } from "react";

/**
 * ServiceWorkerRegister component
 * Registers the service worker and ensures updates are checked regularly.
 * Uses updateViaCache: "none" to prevent the service worker file itself from being cached,
 * ensuring browsers always check for new versions.
 * Non-blocking: failures won't crash the app.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !navigator.serviceWorker
    ) {
      return;
    }

    let cleanupFn: (() => void) | null = null;
    let mounted = true;

    const register = async () => {
      try {
        // Register with updateViaCache: "none" to prevent service worker file caching
        const registration = await navigator.serviceWorker
          .register("/sw.js", {
            updateViaCache: "none",
          })
          .catch((err) => {
            // Silently fail - service worker is optional
            console.warn("Service worker registration failed (non-critical):", err);
            return null;
          });

        if (!registration || !mounted) return;

        // Check for updates immediately after registration (non-blocking)
        registration.update().catch((error: Error) => {
          console.warn("Service worker update check failed (non-critical):", error);
        });

        // Check for updates when page gains focus (user returns to tab)
        const handleFocus = () => {
          if (!mounted) return;
          registration.update().catch((error: Error) => {
            console.warn("Service worker update check on focus failed (non-critical):", error);
          });
        };

        // Check for updates when page becomes visible (user switches back to tab)
        const handleVisibilityChange = () => {
          if (!mounted || document.hidden) return;
          registration.update().catch((error: Error) => {
            console.warn(
              "Service worker update check on visibility change failed (non-critical):",
              error
            );
          });
        };

        window.addEventListener("focus", handleFocus);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        // Store cleanup function
        cleanupFn = () => {
          mounted = false;
          window.removeEventListener("focus", handleFocus);
          document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
      } catch (err) {
        // Silently fail - service worker is optional
        console.warn("Service worker setup failed (non-critical):", err);
      }
    };

    // Delay registration slightly to not block initial render
    const timeoutId = setTimeout(register, 100);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      if (cleanupFn) {
        cleanupFn();
      }
    };
  }, []);

  return null;
}
