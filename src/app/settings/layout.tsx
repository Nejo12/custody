import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | Custody Clarity",
  description: "Configure language, safety options, and privacy settings.",
  alternates: {
    canonical: "https://custodyclarity.com/settings",
  },
  openGraph: {
    title: "Settings | Custody Clarity",
    description: "Configure language, safety options, and privacy settings.",
    type: "website",
    url: "https://custodyclarity.com/settings",
    images: [
      {
        url: "https://custodyclarity.com/og",
        width: 1200,
        height: 630,
        alt: "Custody Clarity - Settings",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Settings | Custody Clarity",
    description: "Configure language, safety options, and privacy settings.",
    images: ["https://custodyclarity.com/og"],
  },
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
