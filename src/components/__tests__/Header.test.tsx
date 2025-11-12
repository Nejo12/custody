import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Header from "../Header";
import { useI18n } from "@/i18n";
import { useAppStore } from "@/store/app";

vi.mock("@/i18n", () => ({
  useI18n: vi.fn(),
}));

vi.mock("@/store/app", () => ({
  useAppStore: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}));

vi.mock("../LanguageSwitch", () => ({
  default: () => <div data-testid="language-switch">LanguageSwitch</div>,
}));

vi.mock("../CitySwitch", () => ({
  default: () => <div data-testid="city-switch">CitySwitch</div>,
}));

vi.mock("../useInstallPrompt", () => ({
  useInstallPrompt: () => ({
    canInstall: false,
    promptInstall: vi.fn(),
  }),
}));

describe("Header", () => {
  const mockOnOpenHelp = vi.fn();
  const mockReplace = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as { location?: { replace?: typeof mockReplace } }).location;
    (window as { location: { replace: typeof mockReplace } }).location = { replace: mockReplace };

    (useI18n as ReturnType<typeof vi.fn>).mockReturnValue({
      t: {
        appName: "Custody Clarity",
        header: {
          findHelp: "Need help?",
          quickExit: "Quick Exit",
          settings: "Settings",
          installApp: "Install App",
          more: "More",
          discreetAppName: "Documents",
        },
      },
    });

    (useAppStore as ReturnType<typeof vi.fn>).mockReturnValue({
      safetyMode: false,
      discreetMode: false,
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

  it("has container with max width inside header", () => {
    render(<Header />);
    const container = screen.getByRole("banner").querySelector(".max-w-xl");
    expect(container).toBeInTheDocument();
  });

  it("displays app name in different locales", () => {
    (useI18n as ReturnType<typeof vi.fn>).mockReturnValue({
      t: {
        appName: "ElternWeg",
        header: {},
      },
    });

    render(<Header />);
    expect(screen.getByText("ElternWeg")).toBeInTheDocument();
  });

  it("calls onOpenHelp when help button clicked", () => {
    render(<Header onOpenHelp={mockOnOpenHelp} />);
    const helpButton = screen.getByLabelText(/Need help/i);
    fireEvent.click(helpButton);
    expect(mockOnOpenHelp).toHaveBeenCalledTimes(1);
  });

  it("renders quick exit button", () => {
    render(<Header />);
    const quickExit = screen.getByLabelText(/Quick Exit/i);
    expect(quickExit).toBeInTheDocument();
  });

  it("redirects to google when quick exit clicked", () => {
    render(<Header />);
    const quickExit = screen.getByLabelText(/Quick Exit/i);
    fireEvent.click(quickExit);
    expect(mockReplace).toHaveBeenCalledWith("https://www.google.com");
  });

  it("handles safety mode quick exit keyboard shortcut", () => {
    (useAppStore as ReturnType<typeof vi.fn>).mockReturnValue({
      safetyMode: true,
      discreetMode: false,
    });
    render(<Header />);
    const event = new KeyboardEvent("keydown", { key: "Escape", shiftKey: true });
    window.dispatchEvent(event);
    expect(mockReplace).toHaveBeenCalledWith("https://www.google.com");
  });

  it("does not trigger quick exit without shift key", () => {
    (useAppStore as ReturnType<typeof vi.fn>).mockReturnValue({
      safetyMode: true,
      discreetMode: false,
    });
    render(<Header />);
    const event = new KeyboardEvent("keydown", { key: "Escape", shiftKey: false });
    window.dispatchEvent(event);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("displays discreet mode app name", () => {
    (useAppStore as ReturnType<typeof vi.fn>).mockReturnValue({
      safetyMode: false,
      discreetMode: true,
    });
    render(<Header />);
    expect(screen.getByText("Documents")).toBeInTheDocument();
  });

  it("opens mobile menu when more button clicked", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: true, // Mobile view
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
    render(<Header />);
    const moreButton = screen.getByText("More");
    fireEvent.click(moreButton);
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("closes mobile menu when clicking outside", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <Header />
      </div>
    );
    const moreButton = screen.getByText("More");
    fireEvent.click(moreButton);
    expect(screen.getByRole("menu")).toBeInTheDocument();

    const outside = screen.getByTestId("outside");
    fireEvent.mouseDown(outside);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
