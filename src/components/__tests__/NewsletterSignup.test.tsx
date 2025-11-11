import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nProvider } from "@/i18n";
import NewsletterSignup from "../NewsletterSignup";

const renderWithI18n = (component: React.ReactElement) => {
  return render(<I18nProvider>{component}</I18nProvider>);
};

// Mock fetch
global.fetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

describe("NewsletterSignup", () => {
  it("should render default variant", () => {
    renderWithI18n(<NewsletterSignup />);
    expect(screen.getByText("Stay Updated")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your email address")).toBeInTheDocument();
  });

  it("should render compact variant", () => {
    renderWithI18n(<NewsletterSignup variant="compact" />);
    // Compact variant uses "Your email" placeholder from i18n
    const input = screen.getByLabelText("Email address");
    expect(input).toBeInTheDocument();
    expect(screen.getByText("Subscribe")).toBeInTheDocument();
  });

  it("should render inline variant", () => {
    renderWithI18n(<NewsletterSignup variant="inline" />);
    // Inline variant uses "Your email" placeholder from i18n
    const input = screen.getByLabelText("Email address");
    expect(input).toBeInTheDocument();
  });

  it("should validate email format", async () => {
    const user = userEvent.setup();
    renderWithI18n(<NewsletterSignup />);

    const input = screen.getByPlaceholderText("Your email address");
    const button = screen.getByText("Subscribe");

    // Type invalid email (no @ symbol) and submit
    await user.clear(input);
    await user.type(input, "invalidemail");
    await user.click(button);

    // Wait for error message to appear (default variant shows error below button)
    await waitFor(
      () => {
        const errorText = screen.getByText(/Please enter a valid email address/i);
        expect(errorText).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("should submit valid email", async () => {
    const user = userEvent.setup();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: "Successfully subscribed" }),
    });

    renderWithI18n(<NewsletterSignup />);

    const input = screen.getByPlaceholderText("Your email address");
    const button = screen.getByText("Subscribe");

    await user.type(input, "test@example.com");
    await user.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com" }),
      });
    });
  });

  it("should show success message after subscription", async () => {
    const user = userEvent.setup();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    renderWithI18n(<NewsletterSignup />);

    const input = screen.getByPlaceholderText("Your email address");
    const button = screen.getByText("Subscribe");

    await user.type(input, "test@example.com");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/thank you/i)).toBeInTheDocument();
    });
  });

  it("should show error message on failure", async () => {
    const user = userEvent.setup();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, error: "Server error" }),
    });

    renderWithI18n(<NewsletterSignup />);

    const input = screen.getByPlaceholderText("Your email address");
    const button = screen.getByText("Subscribe");

    await user.type(input, "test@example.com");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText("Server error")).toBeInTheDocument();
    });
  });

  it("should call onSuccess callback after successful subscription", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    renderWithI18n(<NewsletterSignup onSuccess={onSuccess} />);

    const input = screen.getByPlaceholderText("Your email address");
    const button = screen.getByText("Subscribe");

    await user.type(input, "test@example.com");
    await user.click(button);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
