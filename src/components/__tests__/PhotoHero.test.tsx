import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { I18nProvider } from "@/i18n";
import PhotoHero from "../PhotoHero";

/**
 * Test suite for PhotoHero component
 *
 * Tests the animated photo hero component with real images
 */
describe("PhotoHero", () => {
  let mockMediaQuery: {
    matches: boolean;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Mock matchMedia
    mockMediaQuery = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation(() => mockMediaQuery),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProvider = () =>
    render(
      <I18nProvider>
        <PhotoHero />
      </I18nProvider>
    );

  it("renders preview cards and timeline copy", () => {
    renderWithProvider();

    expect(screen.getByText(/Outcome preview/i)).toBeInTheDocument();
    expect(screen.getByText(/Court-ready PDF pack/i)).toBeInTheDocument();
    expect(screen.getByText(/Action timeline/i)).toBeInTheDocument();
    expect(screen.getByText(/Timeline & reminders/i)).toBeInTheDocument();
  });

  it("renders floating legal markers", () => {
    const { container } = renderWithProvider();
    const markers = Array.from(container.querySelectorAll("div")).filter((el) =>
      el.textContent?.match(/§|BGB|Art\.|1626/)
    );
    expect(markers.length).toBeGreaterThan(0);
  });

  it("attaches prefers-reduced-motion listener", () => {
    renderWithProvider();

    expect(window.matchMedia).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");
    expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });

  it("cleans up media query listener on unmount", () => {
    const { unmount } = renderWithProvider();
    unmount();

    expect(mockMediaQuery.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });

  it("respects prefers-reduced-motion preference", () => {
    mockMediaQuery.matches = true;
    renderWithProvider();
    expect(window.matchMedia).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");
  });

  it("renders gradient background container", () => {
    const { container } = renderWithProvider();
    expect(container.querySelector('[class*="bg-gradient-to-br"]')).toBeInTheDocument();
  });
});
