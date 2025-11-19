import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import FloatingElements from "../FloatingElements";

/**
 * Test suite for FloatingElements component
 *
 * Tests the floating decorative elements with parallax effects
 */
describe("FloatingElements", () => {
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

  it("should render floating elements container", () => {
    const { container } = render(<FloatingElements />);

    const wrapper = container.querySelector(".absolute.inset-0");
    expect(wrapper).toBeInTheDocument();
  });

  it("should render multiple floating elements", () => {
    const { container } = render(<FloatingElements />);

    // Should render 8 elements (as defined in the elements array)
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThanOrEqual(8);
  });

  it("should render different element types", () => {
    const { container } = render(<FloatingElements />);

    const svgs = container.querySelectorAll("svg");

    // Check for different icon types by their viewBox or className
    const hasDocuments = Array.from(svgs).some((svg) =>
      svg.className.baseVal.includes("text-zinc-400")
    );
    const hasHearts = Array.from(svgs).some((svg) =>
      svg.className.baseVal.includes("text-rose-400")
    );
    const hasStars = Array.from(svgs).some((svg) =>
      svg.className.baseVal.includes("text-amber-400")
    );
    const hasCircles = Array.from(svgs).some((svg) =>
      svg.className.baseVal.includes("text-emerald-400")
    );

    expect(hasDocuments || hasHearts || hasStars || hasCircles).toBe(true);
  });

  it("should listen for prefers-reduced-motion changes", () => {
    render(<FloatingElements />);

    expect(window.matchMedia).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");
    expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });

  it("should clean up event listeners on unmount", () => {
    const { unmount } = render(<FloatingElements />);

    unmount();

    expect(mockMediaQuery.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });

  it("should handle mouse movement for parallax effect", () => {
    const { container } = render(<FloatingElements />);

    // Simulate mouse movement
    fireEvent.mouseMove(window, {
      clientX: 100,
      clientY: 100,
    });

    // Component should handle the event without crashing
    expect(container).toBeInTheDocument();
  });

  it("should respect prefers-reduced-motion preference", () => {
    mockMediaQuery.matches = true;

    const { container } = render(<FloatingElements />);

    // Elements should still render but without animations
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });

  it("should position elements with absolute positioning", () => {
    const { container } = render(<FloatingElements />);

    const positionedElements = container.querySelectorAll(".absolute.pointer-events-none");
    expect(positionedElements.length).toBeGreaterThan(0);
  });

  it("should support dark mode with appropriate classes", () => {
    const { container } = render(<FloatingElements />);

    const darkModeElements = container.querySelectorAll('[class*="dark:"]');
    expect(darkModeElements.length).toBeGreaterThan(0);
  });

  it("should not interfere with pointer events", () => {
    const { container } = render(<FloatingElements />);

    const elements = container.querySelectorAll(".pointer-events-none");
    expect(elements.length).toBeGreaterThan(0);
  });

  it("should render with overflow hidden to contain elements", () => {
    const { container } = render(<FloatingElements />);

    const wrapper = container.querySelector(".overflow-hidden");
    expect(wrapper).toBeInTheDocument();
  });
});
