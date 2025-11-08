import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Header from "../Header";
import { useI18n } from "@/i18n";

vi.mock("@/i18n", () => ({
  useI18n: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}));

vi.mock("../LanguageSwitch", () => ({
  default: () => <div data-testid="language-switch">LanguageSwitch</div>,
}));

// ThemeSwitch is not used in Header anymore.

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useI18n as ReturnType<typeof vi.fn>).mockReturnValue({
      t: {
        appName: "Custody Clarity",
      },
    });
  });

  it("renders app name", () => {
    render(<Header />);
    expect(screen.getByText("Custody Clarity")).toBeInTheDocument();
  });

  it("renders app name link to home", () => {
    render(<Header />);
    const link = screen.getByText("Custody Clarity").closest("a");
    expect(link).toHaveAttribute("href", "/");
  });

  it("renders settings control (aria-label)", () => {
    render(<Header />);
    const settings = screen.getByRole("link", { name: /Settings/i });
    expect(settings).toBeInTheDocument();
  });

  it("renders language switch component", () => {
    render(<Header />);
    expect(screen.getByTestId("language-switch")).toBeInTheDocument();
  });

  // Theme switch is not part of Header anymore.

  it("has container with max width inside header", () => {
    render(<Header />);
    const container = screen.getByRole("banner").querySelector(".max-w-xl");
    expect(container).toBeInTheDocument();
  });

  it("displays app name in different locales", () => {
    (useI18n as ReturnType<typeof vi.fn>).mockReturnValue({
      t: {
        appName: "ElternWeg",
      },
    });

    render(<Header />);
    expect(screen.getByText("ElternWeg")).toBeInTheDocument();
  });
});
