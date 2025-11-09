import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Joint Custody Application | Custody Clarity",
  description: "Generate a joint custody application document for German family courts.",
  alternates: {
    canonical: "https://custodyclarity.com/pdf/gemeinsame-sorge",
  },
  openGraph: {
    title: "Joint Custody Application | Custody Clarity",
    description: "Generate a joint custody application document for German family courts.",
    type: "website",
    url: "https://custodyclarity.com/pdf/gemeinsame-sorge",
    images: [
      {
        url: "/og",
        width: 1200,
        height: 630,
        alt: "Custody Clarity - Joint Custody Application",
      },
    ],
  },
};

export default function GemeinsameSorgeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
