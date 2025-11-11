"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Google Analytics 4 tracking component
 * Tracks page views and custom events
 */
export default function Analytics() {
  const pathname = usePathname();
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  // Initialize Google Analytics
  useEffect(() => {
    if (!gaId || typeof window === "undefined") {
      return;
    }

    // Load gtag script if not already loaded
    if (!window.gtag) {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);

      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: unknown[]): void {
        window.dataLayer?.push(args);
      }
      window.gtag = gtag;

      gtag("js", new Date());
      gtag("config", gaId, {
        page_path: pathname,
      });
    }
  }, [gaId, pathname]);

  // Track page views on route change
  useEffect(() => {
    if (!gaId || !window.gtag || typeof window === "undefined") {
      return;
    }

    window.gtag("config", gaId, {
      page_path: pathname,
    });
  }, [pathname, gaId]);

  return null;
}

/**
 * Track a custom event in Google Analytics
 * @param eventName - Name of the event
 * @param eventParams - Additional event parameters
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, string | number | boolean>
): void {
  if (typeof window === "undefined" || !window.gtag) {
    return;
  }

  window.gtag("event", eventName, eventParams);
}

/**
 * Track conversion events (e.g., payment success)
 * @param value - Conversion value in cents
 * @param currency - Currency code (default: EUR)
 * @param transactionId - Unique transaction ID
 */
export function trackConversion(value: number, currency = "EUR", transactionId?: string): void {
  if (typeof window === "undefined" || !window.gtag) {
    return;
  }

  window.gtag("event", "purchase", {
    value: value / 100, // Convert cents to currency units
    currency,
    transaction_id: transactionId,
  });
}

// Extend Window interface for gtag
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (command: string, targetId: string | Date, config?: Record<string, unknown>) => void;
  }
}
