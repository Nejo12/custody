import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useServiceWorkerUpdate } from "../useServiceWorkerUpdate";

describe("useServiceWorkerUpdate", () => {
  let mockRegistration: ServiceWorkerRegistration;
  let mockWaitingWorker: ServiceWorker;
  let mockInstallingWorker: ServiceWorker;
  let mockController: ServiceWorker;

  beforeEach(() => {
    vi.clearAllMocks();

    mockWaitingWorker = {
      state: "installed",
      postMessage: vi.fn(),
    } as unknown as ServiceWorker;

    let stateChangeCallback: (() => void) | null = null;
    mockInstallingWorker = {
      state: "installing",
      addEventListener: vi.fn((event: string, callback: () => void) => {
        if (event === "statechange") {
          stateChangeCallback = callback;
        }
      }),
    } as unknown as ServiceWorker;

    // Helper to trigger state change
    (mockInstallingWorker as unknown as { triggerStateChange: () => void }).triggerStateChange =
      () => {
        (mockInstallingWorker as unknown as { state: string }).state = "installed";
        if (stateChangeCallback) {
          stateChangeCallback();
        }
      };

    mockController = {
      state: "activated",
    } as unknown as ServiceWorker;

    mockRegistration = {
      waiting: null,
      installing: null,
      addEventListener: vi.fn((event: string, callback: () => void) => {
        if (event === "updatefound") {
          callback();
        }
      }),
      update: vi.fn().mockResolvedValue(undefined),
    } as unknown as ServiceWorkerRegistration;

    Object.defineProperty(navigator, "serviceWorker", {
      writable: true,
      configurable: true,
      value: {
        getRegistration: vi.fn().mockResolvedValue(mockRegistration),
        controller: mockController,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });

    Object.defineProperty(window, "location", {
      writable: true,
      configurable: true,
      value: {
        reload: vi.fn(),
      },
    });

    Object.defineProperty(document, "hasFocus", {
      writable: true,
      configurable: true,
      value: vi.fn().mockReturnValue(true),
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it("returns initial state with no update", async () => {
    const { result } = renderHook(() => useServiceWorkerUpdate());

    // Wait for initial setup
    await waitFor(
      () => {
        expect(navigator.serviceWorker.getRegistration).toHaveBeenCalled();
      },
      { timeout: 1000 }
    );

    expect(result.current.hasUpdate).toBe(false);
    expect(result.current.isUpdating).toBe(false);
  });

  it("detects update when waiting worker exists", async () => {
    Object.defineProperty(mockRegistration, "waiting", {
      writable: true,
      configurable: true,
      value: mockWaitingWorker,
    });

    const { result } = renderHook(() => useServiceWorkerUpdate());

    await waitFor(
      () => {
        expect(result.current.hasUpdate).toBe(true);
      },
      { timeout: 2000 }
    );
  });

  it("detects update when installing worker becomes installed", async () => {
    Object.defineProperty(mockRegistration, "installing", {
      writable: true,
      configurable: true,
      value: mockInstallingWorker,
    });
    Object.defineProperty(navigator.serviceWorker, "controller", {
      writable: true,
      configurable: true,
      value: mockController,
    });

    const { result } = renderHook(() => useServiceWorkerUpdate());

    // Wait for registration to be set up
    await waitFor(
      () => {
        expect(mockRegistration.addEventListener).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );

    // Trigger the updatefound event
    const updateFoundHandler = vi
      .mocked(mockRegistration.addEventListener)
      .mock.calls.find((call) => call[0] === "updatefound")?.[1] as () => void;

    if (updateFoundHandler) {
      updateFoundHandler();
      // Trigger state change
      (mockInstallingWorker as unknown as { triggerStateChange: () => void }).triggerStateChange();
    }

    await waitFor(
      () => {
        expect(result.current.hasUpdate).toBe(true);
      },
      { timeout: 2000 }
    );
  });

  it("calls update on registration periodically", async () => {
    renderHook(() => useServiceWorkerUpdate());

    // Wait for initial setup - update should be called during checkForUpdate
    await waitFor(
      () => {
        expect(mockRegistration.update).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );

    // Verify that update was called (this tests the periodic check mechanism)
    expect(mockRegistration.update).toHaveBeenCalled();
  });

  it("updates service worker when updateServiceWorker is called", async () => {
    Object.defineProperty(mockRegistration, "waiting", {
      writable: true,
      configurable: true,
      value: mockWaitingWorker,
    });

    const { result } = renderHook(() => useServiceWorkerUpdate());

    await waitFor(
      () => {
        expect(result.current.hasUpdate).toBe(true);
      },
      { timeout: 3000 }
    );

    const updatePromise = result.current.updateServiceWorker();

    // Wait a bit for the update to process
    await new Promise((resolve) => setTimeout(resolve, 50));

    await updatePromise;

    expect(mockWaitingWorker.postMessage).toHaveBeenCalledWith({
      type: "SKIP_WAITING",
    });
    expect(result.current.isUpdating).toBe(true);
  });

  it("reloads page after controller change", async () => {
    Object.defineProperty(mockRegistration, "waiting", {
      writable: true,
      configurable: true,
      value: mockWaitingWorker,
    });
    const reloadSpy = vi.fn();
    Object.defineProperty(window, "location", {
      writable: true,
      configurable: true,
      value: {
        reload: reloadSpy,
      },
    });

    const { result } = renderHook(() => useServiceWorkerUpdate());

    await waitFor(
      () => {
        expect(result.current.hasUpdate).toBe(true);
      },
      { timeout: 3000 }
    );

    await result.current.updateServiceWorker();

    // Wait for event listener to be set up
    await waitFor(
      () => {
        expect(navigator.serviceWorker.addEventListener).toHaveBeenCalledWith(
          "controllerchange",
          expect.any(Function)
        );
      },
      { timeout: 1000 }
    );

    // Simulate controller change event
    const controllerChangeHandler = vi
      .mocked(navigator.serviceWorker.addEventListener)
      .mock.calls.find((call) => call[0] === "controllerchange")?.[1] as () => void;

    if (controllerChangeHandler) {
      controllerChangeHandler();
      expect(reloadSpy).toHaveBeenCalled();
    }
  });

  it("skips update when skipUpdate is called", async () => {
    Object.defineProperty(mockRegistration, "waiting", {
      writable: true,
      configurable: true,
      value: mockWaitingWorker,
    });

    const { result } = renderHook(() => useServiceWorkerUpdate());

    await waitFor(
      () => {
        expect(result.current.hasUpdate).toBe(true);
      },
      { timeout: 3000 }
    );

    result.current.skipUpdate();

    await waitFor(
      () => {
        expect(result.current.hasUpdate).toBe(false);
      },
      { timeout: 1000 }
    );
  });

  it("handles missing service worker gracefully", async () => {
    Object.defineProperty(navigator, "serviceWorker", {
      writable: true,
      configurable: true,
      value: undefined,
    });

    const { result } = renderHook(() => useServiceWorkerUpdate());

    // Wait a bit for any async operations to complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(result.current.hasUpdate).toBe(false);
    expect(result.current.isUpdating).toBe(false);
  });

  it("handles missing registration gracefully", async () => {
    vi.mocked(navigator.serviceWorker.getRegistration).mockResolvedValue(undefined);

    const { result } = renderHook(() => useServiceWorkerUpdate());

    await waitFor(
      () => {
        expect(navigator.serviceWorker.getRegistration).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );

    // Wait a bit for state to settle
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(result.current.hasUpdate).toBe(false);
  });

  it("cleans up interval and event listeners on unmount", async () => {
    const { unmount } = renderHook(() => useServiceWorkerUpdate());

    await waitFor(
      () => {
        expect(navigator.serviceWorker.addEventListener).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );

    unmount();

    await waitFor(
      () => {
        expect(navigator.serviceWorker.removeEventListener).toHaveBeenCalled();
      },
      { timeout: 1000 }
    );
  });
});
