import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AnimatedHero from "../AnimatedHero";

/**
 * Test suite for AnimatedHero component
 *
 * Tests the split-layout hero section with animations
 */
describe("AnimatedHero", () => {
  it("should render children content", () => {
    render(
      <AnimatedHero>
        <h1>Test Hero Title</h1>
        <p>Test hero description</p>
      </AnimatedHero>
    );

    expect(screen.getByText("Test Hero Title")).toBeInTheDocument();
    expect(screen.getByText("Test hero description")).toBeInTheDocument();
  });

  it("should have correct layout structure", () => {
    const { container } = render(
      <AnimatedHero>
        <div data-testid="hero-content">Content</div>
      </AnimatedHero>
    );

    // Check for grid layout
    const grid = container.querySelector(".grid");
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass("lg:grid-cols-2");
  });

  it("should render PhotoHero component", () => {
    const { container } = render(
      <AnimatedHero>
        <div>Content</div>
      </AnimatedHero>
    );

    // Check for img element (from PhotoHero with Next.js Image)
    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
  });

  it("should have responsive height classes", () => {
    const { container } = render(
      <AnimatedHero>
        <div>Content</div>
      </AnimatedHero>
    );

    const illustrationContainer = container.querySelector(".h-\\[400px\\]");
    expect(illustrationContainer).toBeInTheDocument();
  });

  it("should apply gradient background", () => {
    const { container } = render(
      <AnimatedHero>
        <div>Content</div>
      </AnimatedHero>
    );

    const gradient = container.querySelector(".bg-gradient-to-br");
    expect(gradient).toBeInTheDocument();
  });
});
