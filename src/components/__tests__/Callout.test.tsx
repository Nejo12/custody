import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Callout from "../Callout";

describe("Callout", () => {
  it("renders with default info tone", () => {
    render(<Callout>Test message</Callout>);
    expect(screen.getByText("Test message")).toBeInTheDocument();
  });

  it("renders with title", () => {
    render(<Callout title="Test Title">Test message</Callout>);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test message")).toBeInTheDocument();
  });

  it("renders with info tone", () => {
    render(<Callout tone="info">Info message</Callout>);
    expect(screen.getByText("Info message")).toBeInTheDocument();
  });

  it("renders with warn tone", () => {
    render(<Callout tone="warn">Warning message</Callout>);
    expect(screen.getByText("Warning message")).toBeInTheDocument();
  });

  it("renders with success tone", () => {
    render(<Callout tone="success">Success message</Callout>);
    expect(screen.getByText("Success message")).toBeInTheDocument();
  });

  it("renders with error tone", () => {
    render(<Callout tone="error">Error message</Callout>);
    expect(screen.getByText("Error message")).toBeInTheDocument();
  });
});
