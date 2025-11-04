import { describe, it, expect, beforeEach, vi } from "vitest";
import { render } from "@testing-library/react";
import ThemeInit from "../ThemeInit";
import { useAppStore } from "@/store/app";

vi.mock("@/store/app", () => ({
  useAppStore: vi.fn(),
}));

describe("ThemeInit", () => {
  const mockUpdateResolvedTheme = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      updateResolvedTheme: mockUpdateResolvedTheme,
    });
  });

  it("calls updateResolvedTheme on mount", () => {
    render(<ThemeInit />);
    expect(mockUpdateResolvedTheme).toHaveBeenCalledTimes(1);
  });

  it("renders nothing (null)", () => {
    const { container } = render(<ThemeInit />);
    expect(container.firstChild).toBeNull();
  });

  it("updates theme when updateResolvedTheme changes", () => {
    const { rerender } = render(<ThemeInit />);
    expect(mockUpdateResolvedTheme).toHaveBeenCalledTimes(1);

    const newMockUpdateResolvedTheme = vi.fn();
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      updateResolvedTheme: newMockUpdateResolvedTheme,
    });

    rerender(<ThemeInit />);
    expect(newMockUpdateResolvedTheme).toHaveBeenCalledTimes(1);
  });
});
