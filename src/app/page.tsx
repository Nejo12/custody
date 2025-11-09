import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";

export const metadata: Metadata = {
  title: "Free Custody Rights Calculator Germany | Custody Clarity",
  description:
    "6-minute guided interview for custody and contact rights in Germany. Get instant results with legal citations. Available in 7 languages.",
  keywords: [
    "custody rights",
    "Germany",
    "parental custody",
    "contact rights",
    "family law",
    "BGB",
    "custody calculator",
    "visitation rights",
    "joint custody",
    "sole custody",
    "Amtsgericht",
    "Familiengericht",
  ],
  openGraph: {
    title: "Free Custody Rights Calculator Germany | Custody Clarity",
    description:
      "6-minute guided interview for custody and contact rights in Germany. Get instant results with legal citations. Available in 7 languages.",
    type: "website",
    locale: "en_US",
    alternateLocale: ["de_DE", "ar_SA", "pl_PL", "fr_FR", "tr_TR", "ru_RU"],
    images: [
      {
        url: "/og-image-1200x630.png",
        width: 1200,
        height: 630,
        alt: "Custody Clarity - Know your custody and contact rights in Germany",
      },
    ],
    siteName: "Custody Clarity",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Custody Rights Calculator Germany | Custody Clarity",
    description:
      "6-minute guided interview for custody and contact rights in Germany. Get instant results with legal citations.",
    images: ["/og-image-1200x630.png"],
  },
  alternates: {
    languages: {
      en: "/",
      de: "/?locale=de",
      ar: "/?locale=ar",
      pl: "/?locale=pl",
      fr: "/?locale=fr",
      tr: "/?locale=tr",
      ru: "/?locale=ru",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    google: "vLqWJ7mM6Rw-3P0331ZfKb2qYnLtU7H5ZKv5Lj44K6-2L05ZK",
    yandex: "2235156265",
  },
};

export default function Home() {
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Custody Clarity",
    applicationCategory: "LegalApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
    description:
      "Free 6-minute guided interview for custody and contact rights in Germany. Get instant results with legal citations from BGB. Available in 7 languages.",
    url: "https://custodyclarity.com/",
    inLanguage: ["en", "de", "ar", "pl", "fr", "tr", "ru"],
    featureList: [
      "6-minute guided interview",
      "Instant legal results with citations",
      "PDF document generation",
      "Available in 7 languages",
      "Privacy-first, offline-ready",
      "WCAG AA compliant",
    ],
    audience: {
      "@type": "Audience",
      audienceType: "Parents seeking custody or contact rights information in Germany",
    },
    jurisdiction: {
      "@type": "Country",
      name: "Germany",
    },
    about: {
      "@type": "Thing",
      name: "Family Law",
      description: "German family law regarding parental custody and contact rights (BGB)",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I know my custody rights in Germany?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Take our free 6-minute guided interview. Answer questions about your situation, and get instant results with legal citations from the German Civil Code (BGB). The tool evaluates your specific circumstances and provides relevant legal information.",
        },
      },
      {
        "@type": "Question",
        name: "What is joint custody in Germany?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Joint custody (gemeinsame Sorge) means both parents share decision-making rights for their child. In Germany, married parents automatically have joint custody. Unmarried parents can apply for joint custody under §1626a BGB if paternity is acknowledged.",
        },
      },
      {
        "@type": "Question",
        name: "Can I get contact rights if the other parent blocks contact?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Under §1684 BGB, you have the right to contact with your child. If contact is being blocked, you can apply to the family court (Familiengericht) for a contact order (Umgangsregelung). Our tool helps you understand your rights and prepare the necessary documents.",
        },
      },
      {
        "@type": "Question",
        name: "Is this legal advice?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Custody Clarity provides general legal information only, not individualized legal advice. The tool helps you understand your rights and prepare documents, but you should consult with a qualified family law attorney for advice specific to your situation.",
        },
      },
      {
        "@type": "Question",
        name: "What languages is the tool available in?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Custody Clarity is available in 7 languages: English, German, Arabic, Polish, French, Turkish, and Russian. This makes legal information accessible to diverse communities in Germany.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HomeClient />
    </>
  );
}
