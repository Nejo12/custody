import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Custody Rights Results | Custody Clarity",
  description: "View your custody and contact rights assessment results with legal citations.",
  alternates: {
    canonical: "https://custodyclarity.com/result",
  },
  openGraph: {
    title: "Custody Rights Results | Custody Clarity",
    description: "View your custody and contact rights assessment results with legal citations.",
    type: "website",
    url: "https://custodyclarity.com/result",
    images: [
      {
        url: "/og",
        width: 1200,
        height: 630,
        alt: "Custody Clarity - Custody Rights Results",
      },
    ],
  },
};

export default function ResultLayout({ children }: { children: React.ReactNode }) {
  return children;
}
