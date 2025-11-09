import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal Guides | Custody Clarity",
  description: "Step-by-step guides to help you navigate custody and contact rights in Germany.",
  alternates: {
    canonical: "https://custodyclarity.com/guides",
  },
  openGraph: {
    title: "Legal Guides | Custody Clarity",
    description: "Step-by-step guides to help you navigate custody and contact rights in Germany.",
    type: "website",
    url: "https://custodyclarity.com/guides",
    images: [
      {
        url: "https://custodyclarity.com/og",
        width: 1200,
        height: 630,
        alt: "Custody Clarity - Legal Guides",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Legal Guides | Custody Clarity",
    description: "Step-by-step guides to help you navigate custody and contact rights in Germany.",
    images: ["https://custodyclarity.com/og"],
  },
};

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
