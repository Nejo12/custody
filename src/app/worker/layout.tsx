import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Social Worker Tools | Custody Clarity",
  description:
    "Tools for social workers and support organizations to help clients with custody matters.",
  alternates: {
    canonical: "https://custodyclarity.com/worker",
  },
  openGraph: {
    title: "Social Worker Tools | Custody Clarity",
    description:
      "Tools for social workers and support organizations to help clients with custody matters.",
    type: "website",
    url: "https://custodyclarity.com/worker",
    images: [
      {
        url: "https://custodyclarity.com/og",
        width: 1200,
        height: 630,
        alt: "Custody Clarity - Social Worker Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Social Worker Tools | Custody Clarity",
    description:
      "Tools for social workers and support organizations to help clients with custody matters.",
    images: ["https://custodyclarity.com/og"],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
