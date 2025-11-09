import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Directory | Custody Clarity",
  description: "Find support services, courts, and legal aid organizations in your area.",
  alternates: {
    canonical: "https://custodyclarity.com/directory",
  },
  openGraph: {
    title: "Directory | Custody Clarity",
    description: "Find support services, courts, and legal aid organizations in your area.",
    type: "website",
    url: "https://custodyclarity.com/directory",
    images: [
      {
        url: "https://custodyclarity.com/og",
        width: 1200,
        height: 630,
        alt: "Custody Clarity - Directory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Directory | Custody Clarity",
    description: "Find support services, courts, and legal aid organizations in your area.",
    images: ["https://custodyclarity.com/og"],
  },
};

export default function DirectoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
