"use client";

import { useState } from "react";
import { PRICING, PricingTier, formatPrice } from "@/lib/stripe";
import { trackEvent } from "@/components/Analytics";

interface PricingCardProps {
  tier: PricingTier;
  documentType: string;
  metadata?: Record<string, string>;
  popular?: boolean;
}

export default function PricingCard({
  tier,
  documentType,
  metadata = {},
  popular = false,
}: PricingCardProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const pricing = PRICING[tier];

  const handlePurchase = async () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Track purchase intent from pricing UI
      trackEvent("pricing_purchase_click", {
        tier,
        documentType,
      });
      // Create checkout session
      const response = await fetch("/api/payment/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          email,
          documentType,
          metadata,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout using session URL
      if (!data.url) {
        throw new Error("No checkout URL received");
      }

      window.location.href = data.url;
    } catch (err) {
      console.error("Payment error:", err);
      setError(err instanceof Error ? err.message : "Payment failed");
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative bg-white dark:bg-zinc-900 rounded-lg border ${
        popular ? "border-zinc-900 dark:border-zinc-100" : "border-zinc-200 dark:border-zinc-800"
      } p-6 transition-colors`}
    >
      {popular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-700 px-4 py-1 rounded-full text-xs font-medium">
          Most Popular
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
            {pricing.name}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{pricing.description}</p>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-zinc-500 dark:text-zinc-400">
            {formatPrice(pricing.price, pricing.currency)}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">one-time</span>
        </div>

        <ul className="space-y-2 py-4 border-t border-b border-zinc-200 dark:border-zinc-800">
          {pricing.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-xs">
              <svg
                className="w-3 h-3 text-zinc-500 dark:text-zinc-400 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-zinc-700 dark:text-zinc-500">{feature}</span>
            </li>
          ))}
        </ul>

        <div className="space-y-2">
          <input
            type="email"
            name={`email-${tier}-${documentType}`}
            id={`email-${tier}-${documentType}`}
            placeholder="Your email address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            autoComplete="off"
            data-tier={tier}
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
            disabled={loading}
          />

          {error && <p className="text-red-600 dark:text-red-400 text-xs">{error}</p>}

          <button
            type="button"
            onClick={handlePurchase}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-colors bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-700 hover:bg-black dark:hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Purchase Now"}
          </button>
        </div>

        <p className="text-[10px] text-zinc-500 dark:text-zinc-500 text-center">
          Secure payment via Stripe · Document sent via email
        </p>
      </div>
    </div>
  );
}
