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

describe("HomeClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useI18n as ReturnType<typeof vi.fn>).mockReturnValue({
      t: {
        home: {
          tagline: "Know your custody rights",
          subline: "Takes 6 minutes. No signup.",
          features: "WCAG AA · Privacy‑first · Offline‑ready",
          check: "Check your rights",
          learn: "Learn more",
          support: "Find support",
        },
      },
    });
  });

  it("renders tagline", () => {
    render(<HomeClient />);
    expect(screen.getByText("Know your custody rights")).toBeInTheDocument();
  });

  it("renders subline", () => {
    render(<HomeClient />);
    expect(screen.getByText("Takes 6 minutes. No signup.")).toBeInTheDocument();
  });

  it("renders features", () => {
    render(<HomeClient />);
    expect(screen.getByText("WCAG AA · Privacy‑first · Offline‑ready")).toBeInTheDocument();
  });

  it("renders check link", () => {
    render(<HomeClient />);
    const link = screen.getByText("Check your rights");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/interview");
  });

  it("renders learn link", () => {
    render(<HomeClient />);
    const link = screen.getByText("Learn more");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/learn");
  });

  it("renders support link", () => {
    render(<HomeClient />);
    const link = screen.getByText("Find support");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/directory");
  });

  it("handles missing optional fields", () => {
    (useI18n as ReturnType<typeof vi.fn>).mockReturnValue({
      t: {
        home: {
          tagline: "Test",
        },
      },
    });
    render(<HomeClient />);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });
});
