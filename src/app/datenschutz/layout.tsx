import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutzerklärung | Custody Clarity",
  description: "Datenschutzerklärung und Informationen zur Datenverarbeitung",
  alternates: {
    canonical: "https://custodyclarity.com/datenschutz",
  },
  openGraph: {
    title: "Datenschutzerklärung | Custody Clarity",
    description: "Datenschutzerklärung und Informationen zur Datenverarbeitung",
    type: "website",
    url: "https://custodyclarity.com/datenschutz",
    images: [
      {
        url: "https://custodyclarity.com/og",
        width: 1200,
        height: 630,
        alt: "Custody Clarity - Datenschutzerklärung",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Datenschutzerklärung | Custody Clarity",
    description: "Datenschutzerklärung und Informationen zur Datenverarbeitung",
    images: ["https://custodyclarity.com/og"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function DatenschutzLayout({ children }: { children: React.ReactNode }) {
  return children;
}
