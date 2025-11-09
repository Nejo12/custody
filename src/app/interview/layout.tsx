import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Custody Rights Interview | Custody Clarity",
  description: "Answer a few questions to understand your custody and contact rights in Germany.",
  alternates: {
    canonical: "https://custodyclarity.com/interview",
  },
  openGraph: {
    title: "Custody Rights Interview | Custody Clarity",
    description: "Answer a few questions to understand your custody and contact rights in Germany.",
    type: "website",
    url: "https://custodyclarity.com/interview",
    images: [
      {
        url: "https://custodyclarity.com/og",
        width: 1200,
        height: 630,
        alt: "Custody Clarity - Custody Rights Interview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Custody Rights Interview | Custody Clarity",
    description: "Answer a few questions to understand your custody and contact rights in Germany.",
    images: ["https://custodyclarity.com/og"],
  },
};

export default function InterviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
