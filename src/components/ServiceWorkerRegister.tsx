"use client";
import { useEffect } from "react";

/**
 * ServiceWorkerRegister component
 * Registers the service worker and ensures updates are checked regularly.
 * Uses updateViaCache: "none" to prevent the service worker file itself from being cached,
 * ensuring browsers always check for new versions.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !navigator.serviceWorker) {
      return;
    }

    let cleanupFn: (() => void) | null = null;

    const register = async () => {
      try {
        // Register with updateViaCache: "none" to prevent service worker file caching
        const registration = await navigator.serviceWorker.register("/sw.js", {
          updateViaCache: "none",
        });

        // Check for updates immediately after registration
        await registration.update();

        // Check for updates when page gains focus (user returns to tab)
        const handleFocus = () => {
          registration.update().catch((error: Error) => {
            console.warn("Service worker update check on focus failed:", error);
          });
        };

        // Check for updates when page becomes visible (user switches back to tab)
        const handleVisibilityChange = () => {
          if (!document.hidden) {
            registration.update().catch((error: Error) => {
              console.warn("Service worker update check on visibility change failed:", error);
            });
          }
        };

        window.addEventListener("focus", handleFocus);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        // Store cleanup function
        cleanupFn = () => {
          window.removeEventListener("focus", handleFocus);
          document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
      } catch (err) {
        console.warn("SW registration failed", err);
      }
    };

    register();

    return () => {
      if (cleanupFn) {
        cleanupFn();
      }
    };
  }, []);

  return null;
}
