import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn Item | Custody Clarity",
  description: "Educational resource about custody and contact rights in Germany.",
  alternates: {
    canonical: "https://custodyclarity.com/learn/item",
  },
  openGraph: {
    title: "Learn Item | Custody Clarity",
    description: "Educational resource about custody and contact rights in Germany.",
    type: "website",
    url: "https://custodyclarity.com/learn/item",
  },
};

export default function LearnItemLayout({ children }: { children: React.ReactNode }) {
  return children;
}
