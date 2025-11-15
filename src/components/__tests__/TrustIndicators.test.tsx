import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TrustIndicators from "../TrustIndicators";
import { useI18n } from "@/i18n";

vi.mock("@/i18n", () => ({
  useI18n: vi.fn(),
}));

describe("TrustIndicators", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useI18n as ReturnType<typeof vi.fn>).mockReturnValue({
      t: {
        home: {
          trustIndicators: {
            legalCitations: "Legal Citations from BGB",
            noSignup: "No Signup Required",
            privacyFirst: "Privacy-First",
            free: "Free to Use",
          },
        },
      },
    });
  });

  it("renders all trust indicators", () => {
    render(<TrustIndicators />);
    expect(screen.getByText("Legal Citations from BGB")).toBeInTheDocument();
    expect(screen.getByText("No Signup Required")).toBeInTheDocument();
    expect(screen.getByText("Privacy-First")).toBeInTheDocument();
    expect(screen.getByText("Free to Use")).toBeInTheDocument();
  });

  it("renders trust indicator icons", () => {
    const { container } = render(<TrustIndicators />);
    const svgElements = container.querySelectorAll("svg");
    expect(svgElements.length).toBeGreaterThan(0);
  });
});
