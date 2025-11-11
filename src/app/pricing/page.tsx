"use client";

import { useEffect } from "react";
import PricingCard from "@/components/PricingCard";
import type { PricingTier } from "@/lib/stripe";
import { trackEvent } from "@/components/Analytics";

/**
 * Standalone pricing page that reuses existing pricing components.
 * This renders the three purchase tiers and lets a user buy a PDF
 * without navigating to the result page first.
 */
export default function PricingPage() {
  const tiers: PricingTier[] = ["BASIC", "PROFESSIONAL", "ATTORNEY"];

  // We default to a generic document type here; the modal
  // on the results page customizes this based on status.
  const defaultDocumentType = "custody-document";

  // Track pricing page views for analytics
  useEffect(() => {
    trackEvent("pricing_view", { entry_point: "pricing-page" });
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-zinc-500 dark:text-zinc-400">
          Choose Your Package
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto mt-2">
          One-time purchase. Instant email delivery. Court‑ready PDFs.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {tiers.map((tier, idx) => (
          <PricingCard
            key={tier}
            tier={tier}
            documentType={defaultDocumentType}
            metadata={{ entryPoint: "pricing-page" }}
            popular={idx === 1}
          />
        ))}
      </div>
    </div>
  );
}
