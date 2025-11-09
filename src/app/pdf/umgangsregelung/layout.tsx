import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Order Application | Custody Clarity",
  description: "Generate a contact order application document for German family courts.",
  alternates: {
    canonical: "https://custodyclarity.com/pdf/umgangsregelung",
  },
  openGraph: {
    title: "Contact Order Application | Custody Clarity",
    description: "Generate a contact order application document for German family courts.",
    type: "website",
    url: "https://custodyclarity.com/pdf/umgangsregelung",
    images: [
      {
        url: "https://custodyclarity.com/og",
        width: 1200,
        height: 630,
        alt: "Custody Clarity - Contact Order Application",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Order Application | Custody Clarity",
    description: "Generate a contact order application document for German family courts.",
    images: ["https://custodyclarity.com/og"],
  },
};

export default function UmgangsregelungLayout({ children }: { children: React.ReactNode }) {
  return children;
}
