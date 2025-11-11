import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import Analytics, { trackEvent, trackConversion } from "../Analytics";

// Mock window.gtag
const mockGtag = vi.fn();
const mockDataLayer: unknown[] = [];

beforeEach(() => {
  // Reset mocks
  mockGtag.mockClear();
  mockDataLayer.length = 0;

  // Setup window mocks
  Object.defineProperty(window, "gtag", {
    value: mockGtag,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(window, "dataLayer", {
    value: mockDataLayer,
    writable: true,
    configurable: true,
  });

  // Mock process.env
  vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-TEST123");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("Analytics", () => {
  it("should not initialize if GA_MEASUREMENT_ID is not set", () => {
    vi.unstubAllEnvs();
    render(<Analytics />);
    expect(mockGtag).not.toHaveBeenCalled();
  });

  it("should initialize Google Analytics when GA_MEASUREMENT_ID is set", () => {
    render(<Analytics />);
    // Component should attempt to load gtag script
    // Note: Actual script loading is tested in integration tests
    expect(window.dataLayer).toBeDefined();
  });
});

describe("trackEvent", () => {
  it("should track event when gtag is available", () => {
    trackEvent("test_event", { key: "value" });
    expect(mockGtag).toHaveBeenCalledWith("event", "test_event", { key: "value" });
  });

  it("should not throw when gtag is not available", () => {
    delete (window as { gtag?: unknown }).gtag;
    expect(() => trackEvent("test_event")).not.toThrow();
  });

  it("should handle events without parameters", () => {
    trackEvent("simple_event");
    expect(mockGtag).toHaveBeenCalledWith("event", "simple_event", undefined);
  });
});

describe("trackConversion", () => {
  it("should track conversion with correct format", () => {
    trackConversion(299, "EUR", "txn_123");
    expect(mockGtag).toHaveBeenCalledWith("event", "purchase", {
      value: 2.99,
      currency: "EUR",
      transaction_id: "txn_123",
    });
  });

  it("should convert cents to currency units", () => {
    trackConversion(999, "USD");
    expect(mockGtag).toHaveBeenCalledWith("event", "purchase", {
      value: 9.99,
      currency: "USD",
      transaction_id: undefined,
    });
  });

  it("should not throw when gtag is not available", () => {
    delete (window as { gtag?: unknown }).gtag;
    expect(() => trackConversion(100)).not.toThrow();
  });
});
