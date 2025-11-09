import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn | Custody Clarity",
  description: "Educational resources and information about custody and contact rights in Germany.",
  alternates: {
    canonical: "https://custodyclarity.com/learn",
  },
  openGraph: {
    title: "Learn | Custody Clarity",
    description:
      "Educational resources and information about custody and contact rights in Germany.",
    type: "website",
    url: "https://custodyclarity.com/learn",
    images: [
      {
        url: "/og",
        width: 1200,
        height: 630,
        alt: "Custody Clarity - Learn",
      },
    ],
  },
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
