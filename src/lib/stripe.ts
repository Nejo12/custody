import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error(
        "STRIPE_SECRET_KEY is not set in environment variables. " +
          "Get your test key from https://dashboard.stripe.com/test/apikeys"
      );
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-07-30.basil" as Stripe.LatestApiVersion,
      typescript: true,
    });
  }
  return stripeInstance;
}

// Lazy initialization: only creates Stripe instance when actually accessed
// This allows client components to import PRICING/formatPrice without errors
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const instance = getStripe();
    const value = instance[prop as keyof Stripe];
    return typeof value === "function" ? value.bind(instance) : value;
  },
}) as Stripe;

/**
 * Product pricing tiers for PDF generation
 */
export const PRICING = {
  BASIC: {
    id: "basic",
    name: "Basic PDF",
    price: 299, // €2.99 in cents
    currency: "eur",
    description: "Single document PDF with basic formatting",
    features: ["One document type", "PDF download", "Email delivery"],
  },
  PROFESSIONAL: {
    id: "professional",
    name: "Professional Package",
    price: 999, // €9.99 in cents
    currency: "eur",
    description: "All document types with professional formatting",
    features: [
      "All document types",
      "Professional formatting",
      "Email delivery",
      "Legal checklist",
      "Email support (48h response)",
    ],
  },
  ATTORNEY: {
    id: "attorney",
    name: "Attorney Package",
    price: 2999, // €29.99 in cents
    currency: "eur",
    description: "Court-ready documents with legal support",
    features: [
      "All document types",
      "Court-ready formatting",
      "Supporting evidence templates",
      "Court submission guide",
      "Priority email support (24h response)",
      "Document review checklist",
    ],
  },
} as const;

export type PricingTier = keyof typeof PRICING;

/**
 * Format price for display (e.g., 299 -> "€2.99")
 */
export function formatPrice(cents: number, currency = "eur"): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}
