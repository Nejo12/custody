import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import Analytics, { trackEvent, trackConversion } from "../Analytics";

// Mock Next.js navigation hooks
const mockPathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

// Mock Next.js Script component
// Script component is mocked to return null since we're testing component behavior, not script execution
vi.mock("next/script", () => ({
  default: () => null,
}));

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
  // Clean up window properties
  delete (window as { gtag?: unknown }).gtag;
  delete (window as { dataLayer?: unknown }).dataLayer;
});

describe("Analytics", () => {
  it("should not render Script components if GA_MEASUREMENT_ID is not set", () => {
    vi.unstubAllEnvs();
    const { container } = render(<Analytics />);
    // Component should return null when GA ID is not set
    expect(container.firstChild).toBeNull();
  });

  it("should render Script components when GA_MEASUREMENT_ID is set", () => {
    render(<Analytics />);
    // Script components are mocked, so we just verify the component renders without errors
    expect(window.dataLayer).toBeDefined();
  });

  it("should track page views when pathname changes", async () => {
    render(<Analytics />);

    // Wait for useEffect to run and track the initial page view
    await waitFor(() => {
      expect(mockGtag).toHaveBeenCalledWith("config", "G-TEST123", {
        page_path: "/",
      });
    });
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
