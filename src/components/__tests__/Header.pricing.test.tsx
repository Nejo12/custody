import { describe, it, beforeEach, vi, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Header from "../Header";

vi.mock("@/i18n", () => ({
  useI18n: () => ({
    t: {
      appName: "Custody Clarity",
      header: { findHelp: "Need help?", quickExit: "Quick Exit", settings: "Settings" },
    },
  }),
}));

vi.mock("@/store/app", () => ({
  useAppStore: () => ({ safetyMode: false, discreetMode: false }),
}));

vi.mock("next/link", () => ({
  default: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}));

vi.mock("../LanguageSwitch", () => ({ default: () => <div /> }));
vi.mock("../CitySwitch", () => ({ default: () => <div /> }));
vi.mock("../useInstallPrompt", () => ({ useInstallPrompt: () => ({ canInstall: false }) }));

describe("Header pricing link", () => {
  beforeEach(() => {
    // clean up any previous DOM state
    document.body.innerHTML = "";
  });

  it("shows Pro Documents link in mobile menu", () => {
    render(<Header />);
    // open mobile menu (More)
    const more = screen.getByText(/More/i);
    fireEvent.click(more);
    const link = screen.getByRole("link", { name: /Pro Documents/i });
    expect(link).toBeInTheDocument();
  });
});
