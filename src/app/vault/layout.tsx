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
        url: "/og",
        width: 1200,
        height: 630,
        alt: "Custody Clarity - Vault",
      },
    ],
  },
};

export default function VaultLayout({ children }: { children: React.ReactNode }) {
  return children;
}
