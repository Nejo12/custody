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

vi.mock("@/data/blog.json", () => ({
  default: {
    posts: [
      {
        slug: "post-1",
        title: "Recent Post 1",
        readTime: "5 min read",
        published: "2025-01-15",
      },
      {
        slug: "post-2",
        title: "Recent Post 2",
        readTime: "8 min read",
        published: "2025-01-10",
      },
      {
        slug: "post-3",
        title: "Older Post",
        readTime: "10 min read",
        published: "2025-01-01",
      },
    ],
  },
}));

describe("HomeClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useI18n as ReturnType<typeof vi.fn>).mockReturnValue({
      t: {
        home: {
          tagline: "Know your custody rights",
          heroTitle: "Know Your Custody & Contact Rights in 6 Minutes",
          heroSubtitle:
            "Guided interview, instant outcome with § references, and a court-ready PDF pack you can act on today.",
          subline: "Takes 6 minutes. No signup.",
          features: "WCAG AA · Privacy‑first · Offline‑ready",
          heroRibbon: "Built from real family-law frustration",
          heroCitationsBadge: "BGB citations on every recommendation",
          heroPrivacyBadge: "Privacy-first · No signup",
          heroSpeedBadge: "6-minute guided interview",
          heroSupporting: "No signup. No tracking. Built for stressed parents.",
          heroSecondaryCta: "See a sample checklist",
          check: "Check My Situation",
          checkDescription: "Answer simple questions about your situation and get instant results",
          learn: "Learn the Law",
          learnDescription: "Access legal guides and official resources to understand your rights",
          support: "Find Support",
          supportDescription: "Find local Jugendamt, courts, and support services near you",
          planning: "Planning & Prevention",
          planningDescription: "Protect your parental rights before problems arise",
          latestStoriesTitle: "Latest Blogs",
        },
      },
    });
  });

  it("renders hero title", () => {
    render(<HomeClient />);
    expect(screen.getByText("Know Your Custody & Contact Rights in 6 Minutes")).toBeInTheDocument();
  });

  it("renders hero subtitle", () => {
    render(<HomeClient />);
    expect(
      screen.getByText(
        "Guided interview, instant outcome with § references, and a court-ready PDF pack you can act on today."
      )
    ).toBeInTheDocument();
  });

  it("renders supporting hero line", () => {
    render(<HomeClient />);
    expect(
      screen.getByText("No signup. No tracking. Built for stressed parents.")
    ).toBeInTheDocument();
  });

  it("renders features", () => {
    render(<HomeClient />);
    expect(screen.getByText("BGB citations on every recommendation")).toBeInTheDocument();
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

  it("renders planning link with description", () => {
    render(<HomeClient />);
    const link = screen.getByText("Planning & Prevention");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/planning");
    expect(
      screen.getByText("Protect your parental rights before problems arise")
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

  it("renders Latest Blogs section with 2 most recent posts", () => {
    render(<HomeClient />);
    expect(screen.getByText("Latest Blogs")).toBeInTheDocument();
    expect(screen.getByText("Recent Post 1")).toBeInTheDocument();
    expect(screen.getByText("Recent Post 2")).toBeInTheDocument();
    expect(screen.queryByText("Older Post")).not.toBeInTheDocument();
  });

  it("renders blog post links with correct hrefs", () => {
    render(<HomeClient />);
    const post1Link = screen.getByText("Recent Post 1").closest("a");
    const post2Link = screen.getByText("Recent Post 2").closest("a");
    expect(post1Link).toHaveAttribute("href", "/blog/post-1");
    expect(post2Link).toHaveAttribute("href", "/blog/post-2");
  });

  it("renders blog post read times", () => {
    render(<HomeClient />);
    expect(screen.getByText("5 min read")).toBeInTheDocument();
    expect(screen.getByText("8 min read")).toBeInTheDocument();
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
