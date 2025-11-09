import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vault | Custody Clarity",
  description: "Store and manage your documents, notes, and payment records securely.",
  alternates: {
    canonical: "https://custodyclarity.com/vault",
  },
  openGraph: {
    title: "Vault | Custody Clarity",
    description: "Store and manage your documents, notes, and payment records securely.",
    type: "website",
    url: "https://custodyclarity.com/vault",
    images: [
      {
        url: "https://custodyclarity.com/og",
        width: 1200,
        height: 630,
        alt: "Custody Clarity - Vault",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vault | Custody Clarity",
    description: "Store and manage your documents, notes, and payment records securely.",
    images: ["https://custodyclarity.com/og"],
  },
};

export default function VaultLayout({ children }: { children: React.ReactNode }) {
  return children;
}
