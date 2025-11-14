import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThemeSwitch from "../ThemeSwitch";

/**
 * ThemeSwitch Component Tests
 *
 * Tests the theme toggle button functionality including:
 * - Rendering with different theme states
 * - Theme toggling behavior (light → dark → system → light)
 * - Accessibility attributes
 * - Icon display for each theme state
 * - Mounted state handling to prevent hydration mismatches
 */

// Mock next-themes
const mockSetTheme = vi.fn();
const mockUseTheme = vi.fn();

vi.mock("next-themes", () => ({
  useTheme: () => mockUseTheme(),
}));

// Mock i18n
vi.mock("@/i18n", () => ({
  useI18n: () => ({
    t: {
      settings: {
        themeLight: "Light",
        themeDark: "Dark",
        themeSystem: "System",
      },
    },
  }),
}));

describe("ThemeSwitch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSetTheme.mockClear();
    // Reset DOM
    document.documentElement.className = "";
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders button", () => {
    mockUseTheme.mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
      resolvedTheme: "light",
    });

    render(<ThemeSwitch />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("renders with light theme after mount", async () => {
    mockUseTheme.mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
      resolvedTheme: "light",
    });

    render(<ThemeSwitch />);

    await waitFor(() => {
      const button = screen.getByRole("button");
      expect(button).not.toBeDisabled();
      expect(button).toHaveAttribute("aria-label", "Light");
      expect(button).toHaveAttribute("title", "Light");
    });
  });

  it("renders with dark theme after mount", async () => {
    mockUseTheme.mockReturnValue({
      theme: "dark",
      setTheme: mockSetTheme,
      resolvedTheme: "dark",
    });

    render(<ThemeSwitch />);

    await waitFor(() => {
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "Dark");
    });
  });

  it("renders with system theme after mount", async () => {
    mockUseTheme.mockReturnValue({
      theme: "system",
      setTheme: mockSetTheme,
      resolvedTheme: "dark",
    });

    render(<ThemeSwitch />);

    await waitFor(() => {
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "System");
    });
  });

  it("toggles from light to dark theme on click", async () => {
    mockUseTheme.mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
      resolvedTheme: "light",
    });

    const user = userEvent.setup();
    render(<ThemeSwitch />);

    await waitFor(() => {
      const button = screen.getByRole("button");
      expect(button).not.toBeDisabled();
    });

    const button = screen.getByRole("button");
    await user.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("toggles from dark to system theme on click", async () => {
    mockUseTheme.mockReturnValue({
      theme: "dark",
      setTheme: mockSetTheme,
      resolvedTheme: "dark",
    });

    const user = userEvent.setup();
    render(<ThemeSwitch />);

    await waitFor(() => {
      const button = screen.getByRole("button");
      expect(button).not.toBeDisabled();
    });

    const button = screen.getByRole("button");
    await user.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith("system");
  });

  it("toggles from system to light theme on click", async () => {
    mockUseTheme.mockReturnValue({
      theme: "system",
      setTheme: mockSetTheme,
      resolvedTheme: "dark",
    });

    const user = userEvent.setup();
    render(<ThemeSwitch />);

    await waitFor(() => {
      const button = screen.getByRole("button");
      expect(button).not.toBeDisabled();
    });

    const button = screen.getByRole("button");
    await user.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("has proper accessibility attributes", async () => {
    mockUseTheme.mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
      resolvedTheme: "light",
    });

    render(<ThemeSwitch />);

    await waitFor(() => {
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "button");
      expect(button).toHaveAttribute("aria-label");
      expect(button).toHaveAttribute("title");
    });
  });

  it("displays correct icon for light theme", async () => {
    mockUseTheme.mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
      resolvedTheme: "light",
    });

    render(<ThemeSwitch />);

    await waitFor(() => {
      const button = screen.getByRole("button");
      const svg = button.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
      expect(svg).toHaveAttribute("aria-hidden", "true");
    });
  });

  it("displays correct icon for dark theme", async () => {
    mockUseTheme.mockReturnValue({
      theme: "dark",
      setTheme: mockSetTheme,
      resolvedTheme: "dark",
    });

    render(<ThemeSwitch />);

    await waitFor(() => {
      const button = screen.getByRole("button");
      const svg = button.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute("aria-hidden", "true");
    });
  });

  it("displays correct icon for system theme", async () => {
    mockUseTheme.mockReturnValue({
      theme: "system",
      setTheme: mockSetTheme,
      resolvedTheme: "dark",
    });

    render(<ThemeSwitch />);

    await waitFor(() => {
      const button = screen.getByRole("button");
      const svg = button.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute("aria-hidden", "true");
    });
  });

  it("includes screen reader text", async () => {
    mockUseTheme.mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
      resolvedTheme: "light",
    });

    render(<ThemeSwitch />);

    await waitFor(() => {
      const srText = screen.getByText("Light", { selector: ".sr-only" });
      expect(srText).toBeInTheDocument();
    });
  });
});
