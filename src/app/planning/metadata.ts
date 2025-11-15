import type { Metadata } from "next";

/**
 * SEO metadata for Planning & Prevention landing page
 * Optimized for search engines and social media sharing
 */
export const planningMetadata: Metadata = {
  title: "Planning & Prevention | Custody Clarity",
  description:
    "Essential legal steps for expectant parents in Germany. Learn how to establish paternity, secure custody rights, and prevent custody disputes before they happen.",
  keywords: [
    "Germany custody rights",
    "paternity acknowledgment",
    "Vaterschaftsanerkennung",
    "Sorgeerklärung",
    "joint custody Germany",
    "unmarried parents Germany",
    "Jugendamt",
    "Standesamt",
    "parental rights Germany",
    "custody prevention",
  ],
  openGraph: {
    title: "Planning & Prevention | Protect Your Parental Rights in Germany",
    description:
      "Step-by-step guides for establishing custody rights. Learn what every unmarried parent needs to know about German family law.",
    type: "website",
    locale: "en_US",
    siteName: "Custody Clarity",
  },
  twitter: {
    card: "summary_large_image",
    title: "Planning & Prevention | Custody Clarity",
    description:
      "Essential legal steps for expectant parents in Germany. Protect your parental rights before problems arise.",
  },
  alternates: {
    canonical: "/planning",
    languages: {
      en: "/planning",
      de: "/planning",
      ar: "/planning",
    },
  },
};
