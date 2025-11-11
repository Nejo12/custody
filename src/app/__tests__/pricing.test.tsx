import { render, screen } from "@testing-library/react";
import { describe, it } from "vitest";
import PricingPage from "../pricing/page";

describe("/pricing page", () => {
  it("renders three pricing tiers", () => {
    render(<PricingPage />);
    // The mocked PRICING names are used by PricingCard
    expect(screen.getByText(/Basic PDF/i)).toBeInTheDocument();
    expect(screen.getByText(/Professional Package/i)).toBeInTheDocument();
    expect(screen.getByText(/Attorney Package/i)).toBeInTheDocument();
  });
});
