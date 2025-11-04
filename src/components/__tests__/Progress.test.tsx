import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Progress from "../Progress";

describe("Progress", () => {
  it("renders progress bar with correct percentage", () => {
    const { container } = render(<Progress current={2} total={5} />);
    const progressBar = container.querySelector(".bg-black");
    expect(progressBar).toBeInTheDocument();
  });

  it("calculates percentage correctly for first step", () => {
    render(<Progress current={0} total={5} />);
    const percentage = screen.getByText("20%");
    expect(percentage).toBeInTheDocument();
  });

  it("calculates percentage correctly for middle step", () => {
    render(<Progress current={2} total={5} />);
    const percentage = screen.getByText("60%");
    expect(percentage).toBeInTheDocument();
  });

  it("calculates percentage correctly for last step", () => {
    render(<Progress current={4} total={5} />);
    const percentage = screen.getByText("100%");
    expect(percentage).toBeInTheDocument();
  });

  it("displays 0% when current is negative", () => {
    render(<Progress current={-1} total={5} />);
    const percentage = screen.getByText("0%");
    expect(percentage).toBeInTheDocument();
  });

  it("rounds percentage correctly", () => {
    render(<Progress current={1} total={3} />);
    const percentage = screen.getByText("67%");
    expect(percentage).toBeInTheDocument();
  });

  it("applies correct width style to progress bar", () => {
    render(<Progress current={2} total={4} />);
    const progressBar = document.querySelector(".bg-black");
    expect(progressBar).toHaveStyle({ width: "75%" });
  });

  it("handles single step correctly", () => {
    render(<Progress current={0} total={1} />);
    const percentage = screen.getByText("100%");
    expect(percentage).toBeInTheDocument();
  });

  it("handles large numbers correctly", () => {
    render(<Progress current={50} total={100} />);
    const percentage = screen.getByText("51%");
    expect(percentage).toBeInTheDocument();
  });
});
