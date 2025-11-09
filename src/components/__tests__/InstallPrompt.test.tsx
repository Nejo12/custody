import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import InstallPrompt from "../InstallPrompt";
import { useInstallPrompt } from "../useInstallPrompt";

vi.mock("../useInstallPrompt", () => ({
  useInstallPrompt: vi.fn(),
}));

describe("InstallPrompt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when canInstall is false", async () => {
    vi.mocked(useInstallPrompt).mockReturnValue({
      canInstall: false,
      promptInstall: vi.fn(),
    });
    const { container } = render(<InstallPrompt />);
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it("renders when canInstall is true", () => {
    vi.mocked(useInstallPrompt).mockReturnValue({
      canInstall: true,
      promptInstall: vi.fn(),
    });
    render(<InstallPrompt />);
    expect(screen.getByText(/Install this app/)).toBeInTheDocument();
  });

  it("calls promptInstall when install button is clicked", async () => {
    const mockPromptInstall = vi.fn();
    vi.mocked(useInstallPrompt).mockReturnValue({
      canInstall: true,
      promptInstall: mockPromptInstall,
    });
    render(<InstallPrompt />);
    const button = screen.getByText("Install");
    fireEvent.click(button);
    await waitFor(() => {
      expect(mockPromptInstall).toHaveBeenCalled();
    });
  });
});
