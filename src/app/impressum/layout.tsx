import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum | Custody Clarity",
  description: "Impressum und rechtliche Angaben zu Custody Clarity",
  alternates: {
    canonical: "https://custodyclarity.com/impressum",
  },
  openGraph: {
    title: "Impressum | Custody Clarity",
    description: "Impressum und rechtliche Angaben zu Custody Clarity",
    type: "website",
    url: "https://custodyclarity.com/impressum",
    images: [
      {
        url: "https://custodyclarity.com/og",
        width: 1200,
        height: 630,
        alt: "Custody Clarity - Impressum",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Impressum | Custody Clarity",
    description: "Impressum und rechtliche Angaben zu Custody Clarity",
    images: ["https://custodyclarity.com/og"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ImpressumLayout({ children }: { children: React.ReactNode }) {
  return children;
}
