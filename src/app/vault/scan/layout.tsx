import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Document Scanner | Custody Clarity",
  description: "Scan and extract information from documents using OCR technology.",
  alternates: {
    canonical: "https://custodyclarity.com/vault/scan",
  },
  openGraph: {
    title: "Document Scanner | Custody Clarity",
    description: "Scan and extract information from documents using OCR technology.",
    type: "website",
    url: "https://custodyclarity.com/vault/scan",
  },
};

export default function ScanLayout({ children }: { children: React.ReactNode }) {
  return children;
}
