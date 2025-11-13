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

        // Check for updates on navigation (when user navigates to new page)
        // This is critical for detecting updates after deployment
        const handleNavigation = () => {
          if (!mounted) return;
          registration.update().catch((error: Error) => {
            console.warn("Service worker update check on navigation failed (non-critical):", error);
          });
        };

        // Listen for Next.js navigation events
        // Next.js uses pushState/replaceState for client-side navigation
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function (...args) {
          originalPushState.apply(history, args);
          handleNavigation();
        };

        history.replaceState = function (...args) {
          originalReplaceState.apply(history, args);
          handleNavigation();
        };

        window.addEventListener("focus", handleFocus);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        // Also listen for popstate (back/forward navigation)
        window.addEventListener("popstate", handleNavigation);

        // Store cleanup function
        cleanupFn = () => {
          mounted = false;
          window.removeEventListener("focus", handleFocus);
          document.removeEventListener("visibilitychange", handleVisibilityChange);
          window.removeEventListener("popstate", handleNavigation);
          // Restore original history methods
          history.pushState = originalPushState;
          history.replaceState = originalReplaceState;
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
