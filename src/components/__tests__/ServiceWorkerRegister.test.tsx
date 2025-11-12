import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render } from "@testing-library/react";
import ServiceWorkerRegister from "../ServiceWorkerRegister";

describe("ServiceWorkerRegister", () => {
  let mockRegistration: ServiceWorkerRegistration;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockRegistration = {
      update: vi.fn().mockResolvedValue(undefined),
    } as unknown as ServiceWorkerRegistration;

    Object.defineProperty(navigator, "serviceWorker", {
      writable: true,
      configurable: true,
      value: {
        register: vi.fn().mockResolvedValue(mockRegistration),
      },
    });

    Object.defineProperty(document, "hidden", {
      writable: true,
      configurable: true,
      value: false,
    });

    Object.defineProperty(window, "addEventListener", {
      writable: true,
      configurable: true,
      value: vi.fn(),
    });

    Object.defineProperty(window, "removeEventListener", {
      writable: true,
      configurable: true,
      value: vi.fn(),
    });

    Object.defineProperty(document, "addEventListener", {
      writable: true,
      configurable: true,
      value: vi.fn(),
    });

    Object.defineProperty(document, "removeEventListener", {
      writable: true,
      configurable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("registers service worker with updateViaCache: none when available", async () => {
    const { container } = render(<ServiceWorkerRegister />);
    expect(container.firstChild).toBeNull();

    await vi.runAllTimersAsync();

    expect(navigator.serviceWorker.register).toHaveBeenCalledWith("/sw.js", {
      updateViaCache: "none",
    });
  });

  it("checks for updates immediately after registration", async () => {
    render(<ServiceWorkerRegister />);

    await vi.runAllTimersAsync();

    expect(mockRegistration.update).toHaveBeenCalled();
  });

  it("sets up focus event listener for update checks", async () => {
    render(<ServiceWorkerRegister />);

    await vi.runAllTimersAsync();

    expect(window.addEventListener).toHaveBeenCalledWith("focus", expect.any(Function));
  });

  it("sets up visibilitychange event listener for update checks", async () => {
    render(<ServiceWorkerRegister />);

    await vi.runAllTimersAsync();

    expect(document.addEventListener).toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function)
    );
  });

  it("checks for updates when focus event fires", async () => {
    render(<ServiceWorkerRegister />);

    await vi.runAllTimersAsync();

    const focusHandler = vi
      .mocked(window.addEventListener)
      .mock.calls.find((call) => call[0] === "focus")?.[1] as () => void;

    if (focusHandler) {
      focusHandler();
      // Wait for async update call
      await vi.runAllTimersAsync();
      expect(mockRegistration.update).toHaveBeenCalledTimes(2); // Once on register, once on focus
    }
  });

  it("checks for updates when visibilitychange event fires and page is visible", async () => {
    Object.defineProperty(document, "hidden", {
      writable: true,
      configurable: true,
      value: false,
    });

    render(<ServiceWorkerRegister />);

    await vi.runAllTimersAsync();

    const visibilityHandler = vi
      .mocked(document.addEventListener)
      .mock.calls.find((call) => call[0] === "visibilitychange")?.[1] as () => void;

    if (visibilityHandler) {
      visibilityHandler();
      // Wait for async update call
      await vi.runAllTimersAsync();
      expect(mockRegistration.update).toHaveBeenCalledTimes(2); // Once on register, once on visibility
    }
  });

  it("does not check for updates when visibilitychange fires and page is hidden", async () => {
    Object.defineProperty(document, "hidden", {
      writable: true,
      configurable: true,
      value: true,
    });

    render(<ServiceWorkerRegister />);

    await vi.runAllTimersAsync();

    const initialUpdateCount = vi.mocked(mockRegistration.update).mock.calls.length;

    const visibilityHandler = vi
      .mocked(document.addEventListener)
      .mock.calls.find((call) => call[0] === "visibilitychange")?.[1] as () => void;

    if (visibilityHandler) {
      visibilityHandler();
      await vi.runAllTimersAsync();
      // Update count should not increase when page is hidden
      expect(mockRegistration.update).toHaveBeenCalledTimes(initialUpdateCount);
    }
  });

  it("handles registration failure gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.mocked(navigator.serviceWorker.register).mockRejectedValueOnce(new Error("Failed"));

    render(<ServiceWorkerRegister />);

    await vi.runAllTimersAsync();

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("handles update check failures gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.mocked(mockRegistration.update).mockRejectedValueOnce(new Error("Update failed"));

    const { container } = render(<ServiceWorkerRegister />);

    await vi.runAllTimersAsync();

    // Should not throw, but may log warnings
    expect(container.firstChild).toBeNull();

    consoleSpy.mockRestore();
  });

  it("cleans up event listeners on unmount", async () => {
    const { unmount } = render(<ServiceWorkerRegister />);

    await vi.runAllTimersAsync();

    unmount();

    expect(window.removeEventListener).toHaveBeenCalledWith("focus", expect.any(Function));
    expect(document.removeEventListener).toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function)
    );
  });

  it("does nothing when service worker is not available", () => {
    Object.defineProperty(navigator, "serviceWorker", {
      writable: true,
      configurable: true,
      value: undefined,
    });

    const { container } = render(<ServiceWorkerRegister />);
    expect(container.firstChild).toBeNull();
    expect(navigator.serviceWorker).toBeUndefined();

    // Restore for other tests
    Object.defineProperty(navigator, "serviceWorker", {
      writable: true,
      configurable: true,
      value: {
        register: vi.fn().mockResolvedValue(mockRegistration),
      },
    });
  });
});
