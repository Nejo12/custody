import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FloatingThemeSwitch from "../FloatingThemeSwitch";
import { useAppStore } from "@/store/app";
import { I18nProvider } from "@/i18n";

describe("FloatingThemeSwitch", () => {
  beforeEach(() => {
    useAppStore.getState().wipeAll();
    vi.clearAllMocks();
  });

  it("renders theme switch button", () => {
    render(
      <I18nProvider>
        <FloatingThemeSwitch />
      </I18nProvider>
    );
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("toggles theme from light to dark", () => {
    useAppStore.getState().setTheme("light");
    render(
      <I18nProvider>
        <FloatingThemeSwitch />
      </I18nProvider>
    );
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(useAppStore.getState().theme).toBe("dark");
  });

  it("toggles theme from dark to system", () => {
    useAppStore.getState().setTheme("dark");
    render(
      <I18nProvider>
        <FloatingThemeSwitch />
      </I18nProvider>
    );
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(useAppStore.getState().theme).toBe("system");
  });

  it("toggles theme from system to light", () => {
    useAppStore.getState().setTheme("system");
    render(
      <I18nProvider>
        <FloatingThemeSwitch />
      </I18nProvider>
    );
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(useAppStore.getState().theme).toBe("light");
  });

  it("is visible on desktop (not hidden with md:hidden)", () => {
    render(
      <I18nProvider>
        <FloatingThemeSwitch />
      </I18nProvider>
    );
    const button = screen.getByRole("button");
    // Verify button has responsive positioning classes
    expect(button.className).toContain("bottom-12");
    // expect(button.className).toContain("md:top-[4rem]");
    // Verify it does NOT have md:hidden
    expect(button.className).not.toContain("md:hidden");
  });
});
