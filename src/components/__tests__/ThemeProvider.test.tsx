import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "../ThemeProvider";

/**
 * ThemeProvider Component Tests
 *
 * Tests the theme provider wrapper functionality including:
 * - Proper wrapping of children
 * - Integration with next-themes ThemeProvider
 * - Correct default props configuration
 */

// Mock next-themes
vi.mock("next-themes", () => ({
  ThemeProvider: ({
    children,
    attribute,
    defaultTheme,
    enableSystem,
    disableTransitionOnChange,
  }: {
    children: React.ReactNode;
    attribute: string;
    defaultTheme: string;
    enableSystem: boolean;
    disableTransitionOnChange: boolean;
  }) => (
    <div
      data-testid="theme-provider"
      data-attribute={attribute}
      data-default-theme={defaultTheme}
      data-enable-system={enableSystem}
      data-disable-transition={disableTransitionOnChange}
    >
      {children}
    </div>
  ),
}));

describe("ThemeProvider", () => {
  it("renders children correctly", () => {
    render(
      <ThemeProvider>
        <div data-testid="child-element">Test Child</div>
      </ThemeProvider>
    );

    const childElement = screen.getByTestId("child-element");
    expect(childElement).toBeInTheDocument();
    expect(childElement).toHaveTextContent("Test Child");
  });

  it("configures next-themes with correct default props", () => {
    render(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    );

    const provider = screen.getByTestId("theme-provider");
    expect(provider).toHaveAttribute("data-attribute", "class");
    expect(provider).toHaveAttribute("data-default-theme", "system");
    expect(provider).toHaveAttribute("data-enable-system", "true");
    expect(provider).toHaveAttribute("data-disable-transition", "true");
  });

  it("allows custom props to be passed through", () => {
    render(
      <ThemeProvider defaultTheme="dark" enableSystem={false}>
        <div>Test</div>
      </ThemeProvider>
    );

    const provider = screen.getByTestId("theme-provider");
    // Custom props should override defaults
    expect(provider).toHaveAttribute("data-default-theme", "dark");
    expect(provider).toHaveAttribute("data-enable-system", "false");
  });

  it("supports multiple children", () => {
    render(
      <ThemeProvider>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <div data-testid="child-3">Child 3</div>
      </ThemeProvider>
    );

    expect(screen.getByTestId("child-1")).toBeInTheDocument();
    expect(screen.getByTestId("child-2")).toBeInTheDocument();
    expect(screen.getByTestId("child-3")).toBeInTheDocument();
  });
});
