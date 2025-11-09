import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Document Summarizer | Custody Clarity",
  description: "Summarize long documents to extract key information quickly.",
  alternates: {
    canonical: "https://custodyclarity.com/vault/summarize",
  },
  openGraph: {
    title: "Document Summarizer | Custody Clarity",
    description: "Summarize long documents to extract key information quickly.",
    type: "website",
    url: "https://custodyclarity.com/vault/summarize",
  },
};

export default function SummarizeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
