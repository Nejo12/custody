import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LanguageSwitch from "../LanguageSwitch";
import { useI18n } from "@/i18n";

vi.mock("@/i18n", () => ({
  useI18n: vi.fn(),
}));

describe("LanguageSwitch", () => {
  const mockSetLocale = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useI18n as ReturnType<typeof vi.fn>).mockReturnValue({
      locale: "en",
      setLocale: mockSetLocale,
    });
  });

  it("renders current locale button and opens list on click", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitch />);
    // Button shows short code (En)
    expect(screen.getByText(/En/i)).toBeInTheDocument();
    // Open list
    await user.click(screen.getByRole("button"));
    // List contains language labels
    expect(screen.getByRole("option", { name: /English/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Deutsch/i })).toBeInTheDocument();
  });

  it("calls setLocale when selecting a language from the list", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitch />);
    await user.click(screen.getByRole("button"));
    await user.click(screen.getByText(/Deutsch/i));
    expect(mockSetLocale).toHaveBeenCalledWith("de");
  });
});
