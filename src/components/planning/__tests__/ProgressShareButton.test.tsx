/**
 * Tests for ProgressShareButton Component
 * Tests share link creation and clipboard functionality
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProgressShareButton from "../ProgressShareButton";
import { useI18n } from "@/i18n";

// Mock i18n
vi.mock("@/i18n", () => ({
  useI18n: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

// Mock navigator.clipboard
const mockWriteText = vi.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

describe("ProgressShareButton", () => {
  const mockT = {
    planning: {
      checklist: {
        createShareLink: "Create Share Link",
        shareLinkCopied: "Copied!",
        shareLinkExpires: "Link expires in {days} days",
        shareDescription:
          "Create a shareable link to show your progress to your partner or advisor.",
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useI18n).mockReturnValue({
      t: mockT,
      locale: "en",
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should render create share link button", () => {
    render(<ProgressShareButton checklistId="checklist-1" email="test@example.com" />);

    expect(screen.getByText("Create Share Link")).toBeInTheDocument();
    expect(
      screen.getByText("Create a shareable link to show your progress to your partner or advisor.")
    ).toBeInTheDocument();
  });

  it("should be disabled when no email or userId provided", () => {
    render(<ProgressShareButton checklistId="checklist-1" />);

    const button = screen.getByText("Create Share Link");
    expect(button).toBeDisabled();
  });

  it("should create share link successfully", async () => {
    vi.useRealTimers();
    const mockShareUrl = "https://example.com/planning/progress/shared/abc123";
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        shareUrl: mockShareUrl,
      }),
    } as Response);

    render(<ProgressShareButton checklistId="checklist-1" email="test@example.com" />);

    const button = screen.getByText("Create Share Link");
    await userEvent.click(button);

    await waitFor(
      () => {
        expect(screen.getByDisplayValue(mockShareUrl)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(fetch).toHaveBeenCalledWith("/api/planning/progress/share", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        checklistId: "checklist-1",
        email: "test@example.com",
        userId: undefined,
        expiresInDays: 30,
      }),
    });
  });

  it("should display error message on API failure", async () => {
    vi.useRealTimers();
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: "Failed to create share link",
      }),
    } as Response);

    render(<ProgressShareButton checklistId="checklist-1" email="test@example.com" />);

    const button = screen.getByText("Create Share Link");
    await userEvent.click(button);

    await waitFor(
      () => {
        expect(screen.getByText("Failed to create share link")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("should copy share URL to clipboard", async () => {
    vi.useRealTimers(); // Use real timers for this test
    const mockShareUrl = "https://example.com/planning/progress/shared/abc123";
    mockWriteText.mockResolvedValueOnce(undefined);

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        shareUrl: mockShareUrl,
      }),
    } as Response);

    render(<ProgressShareButton checklistId="checklist-1" email="test@example.com" />);

    const createButton = screen.getByText("Create Share Link");
    await userEvent.click(createButton);

    await waitFor(
      () => {
        expect(screen.getByDisplayValue(mockShareUrl)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const copyButton = screen.getByText("Copy");
    await userEvent.click(copyButton);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(mockShareUrl);
    });

    expect(screen.getByText("Copied!")).toBeInTheDocument();
  });

  it("should handle clipboard copy error", async () => {
    vi.useRealTimers(); // Use real timers for this test
    const mockShareUrl = "https://example.com/planning/progress/shared/abc123";
    mockWriteText.mockRejectedValueOnce(new Error("Clipboard error"));

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        shareUrl: mockShareUrl,
      }),
    } as Response);

    render(<ProgressShareButton checklistId="checklist-1" email="test@example.com" />);

    const createButton = screen.getByText("Create Share Link");
    await userEvent.click(createButton);

    await waitFor(
      () => {
        expect(screen.getByDisplayValue(mockShareUrl)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const copyButton = screen.getByText("Copy");
    await userEvent.click(copyButton);

    await waitFor(
      () => {
        expect(screen.getByText("Failed to copy link to clipboard")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("should show loading state while creating link", async () => {
    vi.useRealTimers(); // Use real timers for this test
    let resolvePromise: (value: Response) => void;
    const promise = new Promise<Response>((resolve) => {
      resolvePromise = resolve;
    });

    vi.mocked(fetch).mockImplementationOnce(() => promise);

    render(<ProgressShareButton checklistId="checklist-1" email="test@example.com" />);

    const button = screen.getByText("Create Share Link");
    await userEvent.click(button);

    // Check loading state - wait for it to appear
    await waitFor(
      () => {
        expect(screen.getByText("Creating link...")).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    // Resolve the promise
    resolvePromise!({
      ok: true,
      json: async () => ({
        success: true,
        shareUrl: "https://example.com/share/abc",
      }),
    } as Response);

    await waitFor(
      () => {
        expect(screen.queryByText("Creating link...")).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("should work with userId instead of email", async () => {
    vi.useRealTimers(); // Use real timers for this test
    const mockShareUrl = "https://example.com/planning/progress/shared/abc123";
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        shareUrl: mockShareUrl,
      }),
    } as Response);

    render(<ProgressShareButton checklistId="checklist-1" userId="user-123" />);

    const button = screen.getByText("Create Share Link");
    expect(button).not.toBeDisabled();

    await userEvent.click(button);

    await waitFor(
      () => {
        expect(fetch).toHaveBeenCalledWith("/api/planning/progress/share", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            checklistId: "checklist-1",
            email: undefined,
            userId: "user-123",
            expiresInDays: 30,
          }),
        });
      },
      { timeout: 3000 }
    );
  });
});
