import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, afterEach, describe, it, vi, expect } from "vitest";
import PricingCard from "../PricingCard";

describe("PricingCard analytics", () => {
  const originalLocation = window.location;
  const mockGtag = vi.fn();
  let assignedHref = "";

  beforeEach(() => {
    // Stub window.gtag
    Object.defineProperty(window, "gtag", {
      value: mockGtag,
      writable: true,
      configurable: true,
    });
    mockGtag.mockClear();

    // Stub window.fetch
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({ url: "https://checkout.example.com", sessionId: "cs_test_123" }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          )
      )
    );

    // Capture window.location.href assignment
    assignedHref = "";
    // @ts-expect-error allow overwrite for test
    delete window.location;
    // @ts-expect-error redefine for test
    window.location = {
      set href(v: string) {
        assignedHref = v;
      },
      get href() {
        return assignedHref;
      },
    } as unknown as Location;
  });

  afterEach(() => {
    // Restore globals
    delete (window as { gtag?: unknown }).gtag;
    vi.unstubAllGlobals();
    // @ts-expect-error restore
    window.location = originalLocation;
  });

  it("fires pricing_purchase_click when purchasing", async () => {
    render(
      <PricingCard tier="BASIC" documentType="custody-document" metadata={{ entryPoint: "test" }} />
    );

    // Fill email and click purchase
    const emailInput = screen.getByPlaceholderText(/Your email address/i);
    fireEvent.change(emailInput, { target: { value: "buyer@example.com" } });
    const button = screen.getByRole("button", { name: /Purchase Now/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockGtag).toHaveBeenCalledWith("event", "pricing_purchase_click", {
        tier: "BASIC",
        documentType: "custody-document",
      });
    });

    // Ensure redirect was attempted to Stripe URL (optional validation)
    await waitFor(() => {
      expect(assignedHref).toContain("https://checkout.example.com");
    });
  });
});
