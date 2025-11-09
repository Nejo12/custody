import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Text Neutralizer | Custody Clarity",
  description: "Rewrite text to be more neutral and professional for legal documents.",
  alternates: {
    canonical: "https://custodyclarity.com/vault/neutralize",
  },
  openGraph: {
    title: "Text Neutralizer | Custody Clarity",
    description: "Rewrite text to be more neutral and professional for legal documents.",
    type: "website",
    url: "https://custodyclarity.com/vault/neutralize",
  },
};

export default function NeutralizeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
