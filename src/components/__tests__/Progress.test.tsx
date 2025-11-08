import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Progress from "../Progress";

// Mock i18n
vi.mock("@/i18n", () => ({
  useI18n: () => ({
    t: {
      common: {
        step: "Step {idx} of {total}",
      },
    },
  }),
}));

describe("Progress", () => {
  it("renders progress bar and label", () => {
    const { container } = render(<Progress current={2} total={5} />);
    // Bar exists
    const barInner = container.querySelector(".h-2.bg-zinc-900");
    expect(barInner).toBeInTheDocument();
    // Label shows step
    expect(screen.getByText("Step 3 of 5")).toBeInTheDocument();
  });

  it("shows clamped step for first step", () => {
    render(<Progress current={0} total={5} />);
    expect(screen.getByText("Step 1 of 5")).toBeInTheDocument();
  });

  it("shows clamped step for negative current", () => {
    render(<Progress current={-1} total={5} />);
    expect(screen.getByText("Step 1 of 5")).toBeInTheDocument();
  });

  it("applies correct width style to progress bar", () => {
    render(<Progress current={2} total={4} />);
    const progressBar = document.querySelector(".h-2.bg-zinc-900") as HTMLElement;
    expect(progressBar).toHaveStyle({ width: "75%" });
  });

  it("handles single step correctly", () => {
    render(<Progress current={0} total={1} />);
    expect(screen.getByText("Step 1 of 1")).toBeInTheDocument();
  });

  it("handles large numbers correctly", () => {
    render(<Progress current={50} total={100} />);
    expect(screen.getByText("Step 51 of 100")).toBeInTheDocument();
  });
});
