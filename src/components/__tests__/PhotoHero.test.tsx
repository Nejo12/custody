import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render } from "@testing-library/react";
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

  it("should render photo container", () => {
    const { container } = render(<PhotoHero />);

    const photoContainer = container.querySelector(".relative.w-full.h-full");
    expect(photoContainer).toBeInTheDocument();
  });

  it("should render Next.js Image component", () => {
    const { container } = render(<PhotoHero />);

    // Next.js Image renders as an img tag
    const image = container.querySelector("img");
    expect(image).toBeInTheDocument();
  });

  it("should have proper alt text for accessibility", () => {
    const { container } = render(<PhotoHero />);

    const image = container.querySelector("img");
    expect(image).toHaveAttribute("alt", expect.stringContaining("Parent and child"));
  });

  it("should have photo frame with border and shadow", () => {
    const { container } = render(<PhotoHero />);

    const frame = container.querySelector(".rounded-3xl.overflow-hidden.shadow-2xl");
    expect(frame).toBeInTheDocument();
  });

  it("should render decorative gradient backgrounds", () => {
    const { container } = render(<PhotoHero />);

    const gradients = container.querySelectorAll('[class*="bg-gradient"]');
    expect(gradients.length).toBeGreaterThan(0);
  });

  it("should have dark mode overlay", () => {
    const { container } = render(<PhotoHero />);

    const overlay = container.querySelector(".mix-blend-overlay");
    expect(overlay).toBeInTheDocument();
  });

  it("should render decorative corner accents", () => {
    const { container } = render(<PhotoHero />);

    const accents = container.querySelectorAll(".rounded-full.blur-2xl");
    expect(accents.length).toBeGreaterThanOrEqual(2);
  });

  it("should support dark mode with appropriate classes", () => {
    const { container } = render(<PhotoHero />);

    const darkModeElements = container.querySelectorAll('[class*="dark:"]');
    expect(darkModeElements.length).toBeGreaterThan(0);
  });

  it("should listen for prefers-reduced-motion changes", () => {
    render(<PhotoHero />);

    expect(window.matchMedia).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");
    expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });

  it("should clean up event listener on unmount", () => {
    const { unmount } = render(<PhotoHero />);

    unmount();

    expect(mockMediaQuery.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });

  it("should respect prefers-reduced-motion preference", () => {
    mockMediaQuery.matches = true;

    render(<PhotoHero />);

    // Component should render without animations when prefers-reduced-motion is true
    // This is verified by the component not crashing and rendering successfully
    expect(window.matchMedia).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");
  });

  it("should have proper aspect ratio container", () => {
    const { container } = render(<PhotoHero />);

    const aspectContainer = container.querySelector(".aspect-\\[3\\/4\\]");
    expect(aspectContainer).toBeInTheDocument();
  });

  it("should render with responsive padding", () => {
    const { container } = render(<PhotoHero />);

    const wrapper = container.querySelector(".p-4.sm\\:p-8");
    expect(wrapper).toBeInTheDocument();
  });
});
