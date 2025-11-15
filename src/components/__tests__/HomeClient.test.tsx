import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HomeClient from "../HomeClient";
import { useI18n } from "@/i18n";

vi.mock("@/i18n", () => ({
  useI18n: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}));

vi.mock("../FadeIn", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("../HowItWorks", () => ({
  default: () => <div data-testid="how-it-works">How It Works</div>,
}));

vi.mock("../FeatureGrid", () => ({
  default: () => <div data-testid="feature-grid">Feature Grid</div>,
}));

vi.mock("../TrustIndicators", () => ({
  default: () => <div data-testid="trust-indicators">Trust Indicators</div>,
}));

vi.mock("../NewsletterSignup", () => ({
  default: () => <div data-testid="newsletter-signup">Newsletter Signup</div>,
}));

describe("HomeClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useI18n as ReturnType<typeof vi.fn>).mockReturnValue({
      t: {
        home: {
          tagline: "Know your custody rights",
          heroTitle: "Understand Your Custody Rights in 6 Minutes",
          heroSubtitle: "Free guided interview with instant legal results and BGB citations",
          subline: "Takes 6 minutes. No signup.",
          features: "WCAG AA · Privacy‑first · Offline‑ready",
          check: "Check My Situation",
          checkDescription: "Answer simple questions about your situation and get instant results",
          learn: "Learn the Law",
          learnDescription: "Access legal guides and official resources to understand your rights",
          support: "Find Support",
          supportDescription: "Find local Jugendamt, courts, and support services near you",
        },
      },
    });
  });

  it("renders hero title", () => {
    render(<HomeClient />);
    expect(screen.getByText("Understand Your Custody Rights in 6 Minutes")).toBeInTheDocument();
  });

  it("renders hero subtitle", () => {
    render(<HomeClient />);
    expect(
      screen.getByText("Free guided interview with instant legal results and BGB citations")
    ).toBeInTheDocument();
  });

  it("renders subline", () => {
    render(<HomeClient />);
    expect(screen.getByText("Takes 6 minutes. No signup.")).toBeInTheDocument();
  });

  it("renders features", () => {
    render(<HomeClient />);
    expect(screen.getByText("WCAG AA · Privacy‑first · Offline‑ready")).toBeInTheDocument();
  });

  it("renders primary CTA link", () => {
    render(<HomeClient />);
    const link = screen.getByText("Check My Situation");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/interview");
  });

  it("renders learn link with description", () => {
    render(<HomeClient />);
    const link = screen.getByText("Learn the Law");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/learn");
    expect(
      screen.getByText("Access legal guides and official resources to understand your rights")
    ).toBeInTheDocument();
  });

  it("renders support link with description", () => {
    render(<HomeClient />);
    const link = screen.getByText("Find Support");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/directory");
    expect(
      screen.getByText("Find local Jugendamt, courts, and support services near you")
    ).toBeInTheDocument();
  });

  it("renders HowItWorks component", () => {
    render(<HomeClient />);
    expect(screen.getByTestId("how-it-works")).toBeInTheDocument();
  });

  it("renders FeatureGrid component", () => {
    render(<HomeClient />);
    expect(screen.getByTestId("feature-grid")).toBeInTheDocument();
  });

  it("renders TrustIndicators component", () => {
    render(<HomeClient />);
    expect(screen.getByTestId("trust-indicators")).toBeInTheDocument();
  });

  it("renders NewsletterSignup component", () => {
    render(<HomeClient />);
    expect(screen.getByTestId("newsletter-signup")).toBeInTheDocument();
  });

  it("handles missing optional fields", () => {
    (useI18n as ReturnType<typeof vi.fn>).mockReturnValue({
      t: {
        home: {
          heroTitle: "Test Title",
          heroSubtitle: "Test Subtitle",
          check: "Check",
        },
      },
    });
    render(<HomeClient />);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });
});
