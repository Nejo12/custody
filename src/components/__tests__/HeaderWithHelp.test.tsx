import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import HeaderWithHelp from "../HeaderWithHelp";
import { I18nProvider } from "@/i18n";
import { useAppStore } from "@/store/app";

vi.mock("../useInstallPrompt", () => ({
  useInstallPrompt: () => ({
    canInstall: false,
    promptInstall: vi.fn(),
  }),
}));

vi.mock("next/link", () => ({
  default: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}));

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe("HeaderWithHelp", () => {
  beforeEach(() => {
    useAppStore.getState().wipeAll();
    vi.clearAllMocks();
    global.fetch = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ services: [] }), { status: 200 }));
  });

  it("renders header", () => {
    render(
      <I18nProvider>
        <HeaderWithHelp />
      </I18nProvider>
    );
    // Header should be rendered - check for header element by role
    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();
  });

  it("opens help sheet when help button clicked", async () => {
    render(
      <I18nProvider>
        <HeaderWithHelp />
      </I18nProvider>
    );
    const helpButton = screen.getByLabelText(/Need help|Hilfe finden/i);

    await act(async () => {
      helpButton.click();
      // Wait for state updates
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Verify help sheet is open by checking for its content
    expect(screen.queryByText(/Postcode|PLZ|Kod pocztowy/i)).toBeInTheDocument();
  });
});
