import type { Metadata } from "next";
import faqData from "@/data/faq.json";

// Generate FAQ schema for SEO
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: (
    faqData.categories as Array<{ questions: Array<{ question: string; answer: string }> }>
  ).flatMap((cat) =>
    cat.questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    }))
  ),
};

export const metadata: Metadata = {
  title: "FAQ | Custody Clarity",
  description:
    "Frequently asked questions about custody rights, the legal process, and using Custody Clarity in Germany.",
  alternates: {
    canonical: "https://custodyclarity.com/faq",
  },
  openGraph: {
    title: "FAQ | Custody Clarity",
    description:
      "Frequently asked questions about custody rights, the legal process, and using Custody Clarity in Germany.",
    type: "website",
    url: "https://custodyclarity.com/faq",
    images: [
      {
        url: "/og",
        width: 1200,
        height: 630,
        alt: "Custody Clarity - FAQ",
      },
    ],
  },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}
