import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/i18n";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import ThemeInit from "@/components/ThemeInit";
import FloatingThemeSwitch from "@/components/FloatingThemeSwitch";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Custody Clarity",
  description: "Guided custody and contact rights information.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeInit />
        <I18nProvider>
          <div className="min-h-screen flex flex-col items-stretch">
            <ServiceWorkerRegister />
            <Header />
            {/* InstallPrompt removed: persistent install button lives in Header only on mobile */}
            <main className="flex-1 w-full flex flex-col items-center">{children}</main>
            <Footer />
            <FloatingThemeSwitch />
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}
