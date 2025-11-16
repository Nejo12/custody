import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nProvider } from "@/i18n";
import { ThemeProvider } from "@/components/ThemeProvider";
import HeaderWithHelp from "@/components/HeaderWithHelp";
import Footer from "@/components/Footer";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import UpdatePrompt from "@/components/UpdatePrompt";
import FloatingThemeSwitch from "@/components/FloatingThemeSwitch";
import Analytics from "@/components/Analytics";
import ReferralTracker from "@/components/ReferralTracker";

export const metadata: Metadata = {
  title: "Custody Clarity",
  description: "Free tool to help you understand your custody and contact rights in Germany.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/brand-icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192-maskable.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192-maskable.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

/**
 * Root Layout Component
 *
 * The root layout wraps all pages in the application with:
 * - Theme management (next-themes)
 * - Internationalization (i18n)
 * - Analytics and tracking
 * - Service worker registration
 * - Global components (header, footer, etc.)
 *
 * The suppressHydrationWarning attribute on the html tag is required
 * for next-themes to prevent hydration mismatches when applying the theme class.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <ThemeProvider>
          <I18nProvider>
            <Analytics />
            <ReferralTracker />
            <div className="min-h-screen flex flex-col items-stretch">
              <ServiceWorkerRegister />
              <UpdatePrompt />
              <HeaderWithHelp />
              {/* InstallPrompt removed: persistent install button lives in Header only on mobile */}
              <main id="main-content" className="flex-1 w-full flex flex-col items-center">
                {children}
              </main>
              <Footer />
              <FloatingThemeSwitch />
            </div>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
