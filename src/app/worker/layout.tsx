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
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
