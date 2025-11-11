import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nProvider } from "@/i18n";
import CourtReminderButton from "../CourtReminderButton";

const renderWithI18n = (component: React.ReactElement) => {
  return render(<I18nProvider>{component}</I18nProvider>);
};

// Mock fetch
global.fetch = vi.fn();

// Mock buildICS
vi.mock("@/lib/ics", () => ({
  buildICS: vi.fn(() => "BEGIN:VCALENDAR\nEND:VCALENDAR"),
}));

beforeEach(() => {
  vi.clearAllMocks();
  // Mock URL.createObjectURL and URL.revokeObjectURL
  global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
  global.URL.revokeObjectURL = vi.fn();
});

describe("CourtReminderButton", () => {
  it("should render reminder button", () => {
    renderWithI18n(<CourtReminderButton />);
    expect(screen.getByText(/Add filing reminder/i)).toBeInTheDocument();
  });

  it("should download ICS file when clicked", async () => {
    const user = userEvent.setup();
    renderWithI18n(<CourtReminderButton />);

    const button = screen.getByText(/Add filing reminder/i);
    await user.click(button);

    // Check that createObjectURL was called (indicating download)
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  it("should show email input when schedule email reminder is clicked", async () => {
    const user = userEvent.setup();
    renderWithI18n(<CourtReminderButton />);

    const scheduleButton = screen.getByText(/Schedule email reminder/i);
    await user.click(scheduleButton);

    expect(screen.getByLabelText(/Email for reminder/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Reminder date/i)).toBeInTheDocument();
  });

  it("should validate email before scheduling", async () => {
    const user = userEvent.setup();
    renderWithI18n(<CourtReminderButton />);

    const scheduleButton = screen.getByText(/Schedule email reminder/i);
    await user.click(scheduleButton);

    const dateInput = screen.getByLabelText(/Reminder date/i);
    const scheduleBtn = screen.getByText(/Schedule Reminder/i);

    // Set a future date
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.clear(dateInput);
    await user.type(dateInput, futureDate.toISOString().slice(0, 16));

    await user.click(scheduleBtn);

    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });
  });

  it("should schedule email reminder with valid data", async () => {
    const user = userEvent.setup();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, reminderId: 123 }),
    });

    renderWithI18n(<CourtReminderButton email="test@example.com" />);

    const scheduleButton = screen.getByText(/Schedule email reminder/i);
    await user.click(scheduleButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/reminders/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: expect.stringContaining("test@example.com"),
      });
    });
  });

  it("should use provided email if available", async () => {
    const user = userEvent.setup();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    renderWithI18n(<CourtReminderButton email="provided@example.com" />);

    const scheduleButton = screen.getByText(/Schedule email reminder/i);
    await user.click(scheduleButton);

    await waitFor(() => {
      // Check for success message (not just button text)
      expect(screen.getByText(/Reminder scheduled! You'll receive an email/i)).toBeInTheDocument();
    });
  });

  it("should show error message on scheduling failure", async () => {
    const user = userEvent.setup();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, error: "Failed to schedule" }),
    });

    renderWithI18n(<CourtReminderButton email="test@example.com" />);

    const scheduleButton = screen.getByText(/Schedule email reminder/i);
    await user.click(scheduleButton);

    await waitFor(() => {
      expect(screen.getByText("Failed to schedule")).toBeInTheDocument();
    });
  });
});
