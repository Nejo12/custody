import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AnimatedHero from "../AnimatedHero";
import { I18nProvider } from "@/i18n";

/**
 * Test suite for AnimatedHero component
 *
 * Tests the split-layout hero section with animations
 */
describe("AnimatedHero", () => {
  it("should render children content", () => {
    render(
      <I18nProvider>
        <AnimatedHero>
          <h1>Test Hero Title</h1>
          <p>Test hero description</p>
        </AnimatedHero>
      </I18nProvider>
    );

    expect(screen.getByText("Test Hero Title")).toBeInTheDocument();
    expect(screen.getByText("Test hero description")).toBeInTheDocument();
  });

  it("should have correct layout structure", () => {
    const { container } = render(
      <I18nProvider>
        <AnimatedHero>
          <div data-testid="hero-content">Content</div>
        </AnimatedHero>
      </I18nProvider>
    );

    // Check for grid layout
    const grid = container.querySelector(".grid");
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass("lg:grid-cols-2");
  });

  it("should render PhotoHero component", () => {
    const { container } = render(
      <I18nProvider>
        <AnimatedHero>
          <div>Content</div>
        </AnimatedHero>
      </I18nProvider>
    );

    expect(container.textContent).toContain("Outcome preview");
  });

  it("should apply gradient background", () => {
    const { container } = render(
      <I18nProvider>
        <AnimatedHero>
          <div>Content</div>
        </AnimatedHero>
      </I18nProvider>
    );

    const gradient = container.querySelector(".bg-gradient-to-br");
    expect(gradient).toBeInTheDocument();
  });
});
