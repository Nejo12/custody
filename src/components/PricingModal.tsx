"use client";

import PricingCard from "./PricingCard";
import { PricingTier } from "@/lib/stripe";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: string;
  metadata?: Record<string, string>;
}

export default function PricingModal({
  isOpen,
  onClose,
  documentType,
  metadata = {},
}: PricingModalProps) {
  if (!isOpen) return null;

  const tiers: PricingTier[] = ["BASIC", "PROFESSIONAL", "ATTORNEY"];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-zinc-900 rounded-lg border max-w-6xl w-full p-8">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-2 text-zinc-900 dark:text-zinc-50">
              Get Your Pro Document
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
              Choose the package that best fits your needs. All documents are delivered instantly
              via email.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {tiers.map((tier, index) => (
              <PricingCard
                key={tier}
                tier={tier}
                documentType={documentType}
                metadata={metadata}
                popular={index === 1} // Professional tier is most popular
              />
            ))}
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 pt-6 border-t text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span>Instant Email Delivery</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Court-Ready Formatting</span>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-6">
            All prices are one-time payments. No subscriptions or hidden fees.
          </p>
        </div>
      </div>
    </div>
  );
}
