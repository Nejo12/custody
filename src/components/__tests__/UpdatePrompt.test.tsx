import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UpdatePrompt from "../UpdatePrompt";
import { useServiceWorkerUpdate } from "../useServiceWorkerUpdate";
import { useI18n } from "@/i18n";

vi.mock("../useServiceWorkerUpdate", () => ({
  useServiceWorkerUpdate: vi.fn(),
}));

vi.mock("@/i18n", () => ({
  useI18n: vi.fn(),
}));

describe("UpdatePrompt", () => {
  const mockUpdateServiceWorker = vi.fn();
  const mockSkipUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useServiceWorkerUpdate).mockReturnValue({
      hasUpdate: false,
      isUpdating: false,
      updateServiceWorker: mockUpdateServiceWorker,
      skipUpdate: mockSkipUpdate,
    });
    vi.mocked(useI18n).mockReturnValue({
      locale: "en",
      t: {
        updatePrompt: {
          message: "A new version is available.",
          later: "Later",
          updateNow: "Update now",
          updating: "Updating...",
        },
      },
      setLocale: vi.fn(),
    } as unknown as ReturnType<typeof useI18n>);
  });

  it("does not render when hasUpdate is false", () => {
    const { container } = render(<UpdatePrompt />);
    expect(container.firstChild).toBeNull();
  });

  it("renders when hasUpdate is true", async () => {
    vi.mocked(useServiceWorkerUpdate).mockReturnValue({
      hasUpdate: true,
      isUpdating: false,
      updateServiceWorker: mockUpdateServiceWorker,
      skipUpdate: mockSkipUpdate,
    });

    render(<UpdatePrompt />);
    await waitFor(() => {
      expect(screen.getByText("A new version is available.")).toBeInTheDocument();
    });
  });

  it("calls updateServiceWorker when Update now button is clicked", async () => {
    vi.mocked(useServiceWorkerUpdate).mockReturnValue({
      hasUpdate: true,
      isUpdating: false,
      updateServiceWorker: mockUpdateServiceWorker,
      skipUpdate: mockSkipUpdate,
    });

    render(<UpdatePrompt />);
    await waitFor(() => {
      expect(screen.getByText("Update now")).toBeInTheDocument();
    });
    const updateButton = screen.getByText("Update now");
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(mockUpdateServiceWorker).toHaveBeenCalled();
    });
  });

  it("calls skipUpdate when Later button is clicked", async () => {
    vi.mocked(useServiceWorkerUpdate).mockReturnValue({
      hasUpdate: true,
      isUpdating: false,
      updateServiceWorker: mockUpdateServiceWorker,
      skipUpdate: mockSkipUpdate,
    });

    render(<UpdatePrompt />);
    await waitFor(() => {
      expect(screen.getByText("Later")).toBeInTheDocument();
    });
    const laterButton = screen.getByText("Later");
    fireEvent.click(laterButton);

    await waitFor(() => {
      expect(mockSkipUpdate).toHaveBeenCalled();
    });
  });

  it("shows Updating... when isUpdating is true", async () => {
    vi.mocked(useServiceWorkerUpdate).mockReturnValue({
      hasUpdate: true,
      isUpdating: true,
      updateServiceWorker: mockUpdateServiceWorker,
      skipUpdate: mockSkipUpdate,
    });

    render(<UpdatePrompt />);
    await waitFor(() => {
      expect(screen.getByText("Updating...")).toBeInTheDocument();
    });
  });

  it("disables buttons when isUpdating is true", async () => {
    vi.mocked(useServiceWorkerUpdate).mockReturnValue({
      hasUpdate: true,
      isUpdating: true,
      updateServiceWorker: mockUpdateServiceWorker,
      skipUpdate: mockSkipUpdate,
    });

    render(<UpdatePrompt />);
    await waitFor(() => {
      expect(screen.getByText("Updating...")).toBeInTheDocument();
    });
    const updateButton = screen.getByText("Updating...");
    const laterButton = screen.getByText("Later");

    expect(updateButton).toBeDisabled();
    expect(laterButton).toBeDisabled();
  });

  it("becomes visible when hasUpdate changes to true", async () => {
    const { rerender } = render(<UpdatePrompt />);
    expect(screen.queryByText("A new version is available.")).not.toBeInTheDocument();

    vi.mocked(useServiceWorkerUpdate).mockReturnValue({
      hasUpdate: true,
      isUpdating: false,
      updateServiceWorker: mockUpdateServiceWorker,
      skipUpdate: mockSkipUpdate,
    });

    rerender(<UpdatePrompt />);

    await waitFor(() => {
      expect(screen.getByText("A new version is available.")).toBeInTheDocument();
    });
  });
});
