import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logbook | Custody Clarity",
  description: "Keep a chronological log of events and communications.",
  alternates: {
    canonical: "https://custodyclarity.com/vault/logbook",
  },
  openGraph: {
    title: "Logbook | Custody Clarity",
    description: "Keep a chronological log of events and communications.",
    type: "website",
    url: "https://custodyclarity.com/vault/logbook",
  },
};

export default function LogbookLayout({ children }: { children: React.ReactNode }) {
  return children;
}
