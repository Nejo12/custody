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
        url: "/og",
        width: 1200,
        height: 630,
        alt: "Custody Clarity - Legal Guides",
      },
    ],
  },
};

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
