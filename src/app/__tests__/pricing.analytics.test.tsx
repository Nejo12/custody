import { render, waitFor } from "@testing-library/react";
import { describe, it, beforeEach, afterEach, vi, expect } from "vitest";
import PricingPage from "../pricing/page";

describe("/pricing analytics", () => {
  const mockGtag = vi.fn();

  beforeEach(() => {
    Object.defineProperty(window, "gtag", {
      value: mockGtag,
      writable: true,
      configurable: true,
    });
    mockGtag.mockClear();
  });

  afterEach(() => {
    delete (window as { gtag?: unknown }).gtag;
  });

  it("fires pricing_view on mount", async () => {
    render(<PricingPage />);
    await waitFor(() => {
      expect(mockGtag).toHaveBeenCalledWith("event", "pricing_view", {
        entry_point: "pricing-page",
      });
    });
  });
});
