import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import FadeIn from "../FadeIn";

describe("FadeIn", () => {
  it("renders children", () => {
    render(
      <FadeIn>
        <div>Test content</div>
      </FadeIn>
    );
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("renders with default delay", () => {
    render(
      <FadeIn>
        <span>Content</span>
      </FadeIn>
    );
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders with custom delay", () => {
    render(
      <FadeIn delay={0.5}>
        <div>Delayed content</div>
      </FadeIn>
    );
    expect(screen.getByText("Delayed content")).toBeInTheDocument();
  });
});
