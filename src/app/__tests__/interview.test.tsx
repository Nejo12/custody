import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Interview from "../interview/page";
import { I18nProvider } from "@/i18n";
import { useAppStore } from "@/store/app";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("Interview page", () => {
  beforeEach(() => {
    // Reset store interview state between tests
    useAppStore.getState().wipeAll();
  });

  it("shows localized help heading and help content", () => {
    render(
      <I18nProvider>
        <Interview />
      </I18nProvider>
    );
    expect(screen.getByText(/Why this question matters/i)).toBeInTheDocument();
    // First question shows its own help text
    expect(
      screen.getByText(/Married parents generally have joint custody by default/i)
    ).toBeInTheDocument();
  });

  it("advances with Not sure and updates progress label", async () => {
    render(
      <I18nProvider>
        <Interview />
      </I18nProvider>
    );
    // Starts at step 1
    expect(screen.getByText(/Step 1 of/i)).toBeInTheDocument();
    // Click Not sure skip control
    fireEvent.click(screen.getByText(/Not sure/i));
    // After skip, step should advance
    expect(await screen.findByText(/Step 2 of/i)).toBeInTheDocument();
  });
});
