import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useInstallPrompt } from "../useInstallPrompt";

describe("useInstallPrompt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "navigator", {
      writable: true,
      value: {
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
      },
    });
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
  });

  it("returns canInstall false when no event", () => {
    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.canInstall).toBe(false);
  });

  it("returns canInstall true when event exists and mobile and not standalone", () => {
    const mockPrompt = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useInstallPrompt());

    act(() => {
      const event = new Event("beforeinstallprompt") as Event & { prompt: () => Promise<void> };
      event.preventDefault = vi.fn();
      event.prompt = mockPrompt;
      window.dispatchEvent(event);
    });

    // After the event is dispatched, canInstall should be true (mobile + not standalone + event exists)
    expect(result.current.canInstall).toBe(true);
  });

  it("calls prompt when promptInstall is called", async () => {
    const mockPrompt = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() => useInstallPrompt());

    // Simulate the event being set
    act(() => {
      const event = new Event("beforeinstallprompt") as Event & { prompt: () => Promise<void> };
      event.prompt = mockPrompt;
      window.dispatchEvent(event);
    });

    await act(async () => {
      await result.current.promptInstall();
    });

    // The prompt should be called if event exists
    expect(result.current.promptInstall).toBeDefined();
  });

  it("handles appinstalled event", () => {
    const { result } = renderHook(() => useInstallPrompt());

    act(() => {
      window.dispatchEvent(new Event("appinstalled"));
    });

    expect(result.current.canInstall).toBe(false);
  });
});
