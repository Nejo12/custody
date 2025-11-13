"use client";
import { useEffect, useRef, useState, useCallback } from "react";

interface ServiceWorkerUpdateState {
  hasUpdate: boolean;
  isUpdating: boolean;
  updateServiceWorker: () => Promise<void>;
  skipUpdate: () => void;
}

export function useServiceWorkerUpdate(): ServiceWorkerUpdateState {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const waitingWorkerRef = useRef<ServiceWorker | null>(null);
  const checkIntervalRef = useRef<number | null>(null);

  const checkForUpdate = useCallback(async () => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !navigator.serviceWorker
    ) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return;

      registrationRef.current = registration;

      // Check if there's a waiting service worker
      if (registration.waiting) {
        waitingWorkerRef.current = registration.waiting;
        setHasUpdate(true);
        return;
      }

      // Check for updates
      await registration.update();
    } catch (error) {
      console.warn("Service worker update check failed:", error);
    }
  }, []);

  const setupUpdateListener = useCallback(() => {
    if (!registrationRef.current) return null;

    const registration = registrationRef.current;

    // Listen for updates (only set up once)
    const handleUpdateFound = () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      const handleStateChange = () => {
        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
          // New service worker is installed and waiting
          waitingWorkerRef.current = newWorker;
          setHasUpdate(true);
        }
      };

      newWorker.addEventListener("statechange", handleStateChange);
    };

    registration.addEventListener("updatefound", handleUpdateFound);

    // Note: ServiceWorkerRegistration doesn't support removeEventListener
    // The listener will be cleaned up when the registration is replaced
    return null;
  }, []);

  const updateServiceWorker = useCallback(async () => {
    if (!waitingWorkerRef.current) return;

    setIsUpdating(true);
    try {
      // Post message to skip waiting
      waitingWorkerRef.current.postMessage({ type: "SKIP_WAITING" });

      // Listen for controller change to reload
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
      });

      // Fallback: reload after a short delay if controllerchange doesn't fire
      setTimeout(() => {
        if (document.hasFocus()) {
          window.location.reload();
        }
      }, 1000);
    } catch (error) {
      console.error("Failed to update service worker:", error);
      setIsUpdating(false);
    }
  }, []);

  const skipUpdate = useCallback(() => {
    setHasUpdate(false);
    waitingWorkerRef.current = null;
  }, []);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !navigator.serviceWorker
    ) {
      return;
    }

    let updateListenerCleanup: (() => void) | null = null;

    // Initial check and setup
    const setup = async () => {
      await checkForUpdate();
      updateListenerCleanup = setupUpdateListener() || null;
    };
    setup();

    // Set up periodic checks (every 30 seconds for faster update detection)
    checkIntervalRef.current = window.setInterval(() => {
      checkForUpdate();
    }, 30000);

    // Check for updates when page becomes visible (user switches back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkForUpdate();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Check for updates when page gains focus (user returns to tab)
    const handleFocus = () => {
      checkForUpdate();
    };
    window.addEventListener("focus", handleFocus);

    // Check for updates on navigation (when user navigates to new page)
    // This is critical for detecting updates after deployment
    const handleNavigation = () => {
      checkForUpdate();
    };

    // Listen for Next.js navigation events
    // Next.js uses pushState/replaceState for client-side navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args: Parameters<typeof history.pushState>) {
      originalPushState.apply(history, args);
      handleNavigation();
    };

    history.replaceState = function (...args: Parameters<typeof history.replaceState>) {
      originalReplaceState.apply(history, args);
      handleNavigation();
    };

    window.addEventListener("popstate", handleNavigation);

    // Listen for controller change (when update is activated)
    const handleControllerChange = () => {
      if (document.hasFocus()) {
        window.location.reload();
      }
    };
    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("popstate", handleNavigation);
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
      // Restore original history methods
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      if (updateListenerCleanup) {
        updateListenerCleanup();
      }
    };
  }, [checkForUpdate, setupUpdateListener]);

  return {
    hasUpdate,
    isUpdating,
    updateServiceWorker,
    skipUpdate,
  };
}
