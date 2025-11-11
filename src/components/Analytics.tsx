"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

/**
 * Google Analytics 4 configuration parameters
 */
interface GAConfig {
  page_path: string;
}

/**
 * Google Analytics event parameters
 */
interface GAEventParams {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Google Analytics purchase event parameters
 */
interface GAPurchaseParams {
  value: number;
  currency: string;
  transaction_id?: string;
}

/**
 * Google Analytics gtag function signature
 */
type GtagFunction = (
  command: "config" | "event" | "js",
  targetId: string | Date,
  config?: GAConfig | GAEventParams | GAPurchaseParams
) => void;

/**
 * Extend Window interface for Google Analytics
 */
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFunction;
  }
}

/**
 * Google Analytics 4 tracking component
 * Uses Next.js Script component for optimal performance
 * Tracks page views and custom events
 */
export default function Analytics() {
  const pathname = usePathname();
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  // Track page views on route change (after initial load)
  useEffect(() => {
    if (!gaId || !window.gtag || typeof window === "undefined") {
      return;
    }

    const config: GAConfig = {
      page_path: pathname,
    };

    window.gtag("config", gaId, config);
  }, [pathname, gaId]);

  // Don't render anything if GA ID is not configured
  if (!gaId) {
    return null;
  }

  return (
    <>
      {/* Load Google Analytics script */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      {/* Initialize Google Analytics */}
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}

/**
 * Track a custom event in Google Analytics
 * @param eventName - Name of the event
 * @param eventParams - Additional event parameters
 */
export function trackEvent(eventName: string, eventParams?: GAEventParams): void {
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

  const purchaseParams: GAPurchaseParams = {
    value: value / 100, // Convert cents to currency units
    currency,
    transaction_id: transactionId,
  };

  window.gtag("event", "purchase", purchaseParams);
}
