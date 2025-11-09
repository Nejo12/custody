import { describe, it, expect, beforeEach, vi } from "vitest";
import { render } from "@testing-library/react";
import ServiceWorkerRegister from "../ServiceWorkerRegister";

describe("ServiceWorkerRegister", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, "serviceWorker", {
      writable: true,
      configurable: true,
      value: {
        register: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("registers service worker when available", async () => {
    const { container } = render(<ServiceWorkerRegister />);
    expect(container.firstChild).toBeNull();
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(navigator.serviceWorker.register).toHaveBeenCalledWith("/sw.js");
  });

  it("handles registration failure gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.mocked(navigator.serviceWorker.register).mockRejectedValueOnce(new Error("Failed"));
    render(<ServiceWorkerRegister />);
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("does nothing when service worker is not available", () => {
    Object.defineProperty(navigator, "serviceWorker", {
      writable: true,
      configurable: true,
      value: undefined,
    });
    const { container } = render(<ServiceWorkerRegister />);
    expect(container.firstChild).toBeNull();
    // Restore for other tests
    Object.defineProperty(navigator, "serviceWorker", {
      writable: true,
      configurable: true,
      value: {
        register: vi.fn().mockResolvedValue(undefined),
      },
    });
  });
});
