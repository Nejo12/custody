import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Glossary | Custody Clarity",
  description:
    "Glossary of German legal terms related to custody and contact rights, explained in simple language.",
  alternates: {
    canonical: "https://custodyclarity.com/glossary",
  },
  openGraph: {
    title: "Glossary | Custody Clarity",
    description:
      "Glossary of German legal terms related to custody and contact rights, explained in simple language.",
    type: "website",
    url: "https://custodyclarity.com/glossary",
    images: [
      {
        url: "https://custodyclarity.com/og",
        width: 1200,
        height: 630,
        alt: "Custody Clarity - Glossary",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Glossary | Custody Clarity",
    description:
      "Glossary of German legal terms related to custody and contact rights, explained in simple language.",
    images: ["https://custodyclarity.com/og"],
  },
};

export default function GlossaryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
