import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "../Footer";
import { useI18n } from "@/i18n";

vi.mock("@/i18n", () => ({
  useI18n: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("Footer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useI18n as ReturnType<typeof vi.fn>).mockReturnValue({
      t: {
        home: {
          disclaimer: "Information only. Not individualized legal advice.",
        },
        footer: {
          guides: "Guides",
          blog: "Blog",
          impressum: "Impressum",
          datenschutz: "Datenschutz",
        },
      },
    });
  });

  it("renders disclaimer text", () => {
    render(<Footer />);
    expect(
      screen.getByText("Information only. Not individualized legal advice.")
    ).toBeInTheDocument();
  });

  it("renders footer element", () => {
    render(<Footer />);
    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();
  });

  it("displays translated disclaimer", () => {
    (useI18n as ReturnType<typeof vi.fn>).mockReturnValue({
      t: {
        home: {
          disclaimer: "Nur Information – keine individuelle Rechtsberatung.",
        },
        footer: {
          guides: "Guides",
          blog: "Blog",
          impressum: "Impressum",
          datenschutz: "Datenschutz",
        },
      },
    });

    render(<Footer />);
    expect(
      screen.getByText("Nur Information – keine individuelle Rechtsberatung.")
    ).toBeInTheDocument();
  });

  it("has correct styling classes", () => {
    render(<Footer />);
    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveClass("w-full", "max-w-xl", "mx-auto", "text-center");
  });
});
