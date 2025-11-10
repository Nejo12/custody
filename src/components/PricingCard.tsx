"use client";

import { useState } from "react";
import { PRICING, PricingTier, formatPrice } from "@/lib/stripe";
import { loadStripe, Stripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

// Extend Stripe type to include redirectToCheckout
interface StripeWithCheckout extends Stripe {
  redirectToCheckout(options: { sessionId: string }): Promise<{ error?: Error }>;
}

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

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe failed to load");
      }

      const result = await (stripe as StripeWithCheckout).redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (result?.error) {
        throw result.error;
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err instanceof Error ? err.message : "Payment failed");
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-transform hover:scale-105 ${
        popular ? "ring-4 ring-purple-500" : ""
      }`}
    >
      {popular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-1.5 rounded-full text-sm font-bold shadow-lg">
          🔥 MOST POPULAR
        </div>
      )}

      <div className="p-8">
        <h3 className="text-2xl font-bold mb-2">{pricing.name}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">{pricing.description}</p>

        <div className="mb-6">
          <span className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {formatPrice(pricing.price, pricing.currency)}
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">one-time</span>
        </div>

        <ul className="space-y-3 mb-8">
          {pricing.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
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
              <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>

        <div className="space-y-3">
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            disabled={loading}
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handlePurchase}
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-medium transition ${
              popular
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90"
                : "bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-800 dark:hover:bg-gray-600"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? "Processing..." : "Purchase Now"}
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
          Secure payment via Stripe. Document sent via email.
        </p>
      </div>
    </div>
  );
}
