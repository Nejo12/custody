import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// Font mocks no longer needed - using system fonts

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => {
    return { type: "a", props: { href, children } } as React.ReactElement<{
      href: string;
      children: React.ReactNode;
    }>;
  },
}));

// Stub matchMedia for tests
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// Mock @stripe/stripe-js to avoid requiring Stripe publishable key in tests
vi.mock("@stripe/stripe-js", () => ({
  loadStripe: vi.fn(() =>
    Promise.resolve({
      redirectToCheckout: vi.fn(() => Promise.resolve({})),
    })
  ),
}));

// Mock Stripe module to avoid requiring STRIPE_SECRET_KEY in tests
vi.mock("@/lib/stripe", () => ({
  stripe: {
    checkout: {
      sessions: {
        create: vi.fn(),
        retrieve: vi.fn(),
      },
    },
  },
  PRICING: {
    BASIC: {
      id: "basic",
      name: "Basic PDF",
      price: 299,
      currency: "eur",
      description: "Single document PDF with basic formatting",
      features: ["One document type", "PDF download", "Email delivery"],
    },
    PROFESSIONAL: {
      id: "professional",
      name: "Professional Package",
      price: 999,
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
      price: 2999,
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
  },
  formatPrice: (cents: number, currency = "eur") => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  },
}));
