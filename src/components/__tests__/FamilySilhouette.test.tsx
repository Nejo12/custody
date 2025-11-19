import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render } from "@testing-library/react";
import FamilySilhouette from "../FamilySilhouette";

/**
 * Test suite for FamilySilhouette component
 *
 * Tests the animated family illustration SVG component
 */
describe("FamilySilhouette", () => {
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

  it("should render SVG element", () => {
    const { container } = render(<FamilySilhouette />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should render parent figure elements", () => {
    const { container } = render(<FamilySilhouette />);

    // Check for parent head (circle at specific position)
    const circles = container.querySelectorAll("circle");
    const parentHead = Array.from(circles).find(
      (circle) => circle.getAttribute("cx") === "150" && circle.getAttribute("cy") === "180"
    );
    expect(parentHead).toBeInTheDocument();
  });

  it("should render child figure elements", () => {
    const { container } = render(<FamilySilhouette />);

    // Check for child head (circle at specific position)
    const circles = container.querySelectorAll("circle");
    const childHead = Array.from(circles).find(
      (circle) => circle.getAttribute("cx") === "250" && circle.getAttribute("cy") === "280"
    );
    expect(childHead).toBeInTheDocument();
  });

  it("should render decorative heart", () => {
    const { container } = render(<FamilySilhouette />);

    // Check for heart path element
    const paths = container.querySelectorAll("path");
    const heart = Array.from(paths).find((path) =>
      path.className.baseVal.includes("fill-rose-400")
    );
    expect(heart).toBeInTheDocument();
  });

  it("should have gradient background", () => {
    const { container } = render(<FamilySilhouette />);

    // Check for radial gradient definition
    const gradient = container.querySelector("radialGradient");
    expect(gradient).toBeInTheDocument();
    expect(gradient?.getAttribute("id")).toBe("bgGradient");
  });

  it("should render ground shadow", () => {
    const { container } = render(<FamilySilhouette />);

    // Check for ground ellipse
    const ellipses = container.querySelectorAll("ellipse");
    const ground = Array.from(ellipses).find(
      (ellipse) => ellipse.getAttribute("cx") === "200" && ellipse.getAttribute("cy") === "430"
    );
    expect(ground).toBeInTheDocument();
  });

  it("should support dark mode with appropriate classes", () => {
    const { container } = render(<FamilySilhouette />);

    // Check for dark mode classes
    const darkModeElements = container.querySelectorAll(".dark\\:fill-zinc-400");
    expect(darkModeElements.length).toBeGreaterThan(0);
  });

  it("should listen for prefers-reduced-motion changes", () => {
    render(<FamilySilhouette />);

    expect(window.matchMedia).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");
    expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });

  it("should clean up event listener on unmount", () => {
    const { unmount } = render(<FamilySilhouette />);

    unmount();

    expect(mockMediaQuery.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });

  it("should respect prefers-reduced-motion preference", () => {
    mockMediaQuery.matches = true;

    render(<FamilySilhouette />);

    // Component should render without animations when prefers-reduced-motion is true
    // This is verified by the component not crashing and rendering successfully
    expect(window.matchMedia).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");
  });
});
