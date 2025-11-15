import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HowItWorks from "../HowItWorks";
import { useI18n } from "@/i18n";

vi.mock("@/i18n", () => ({
  useI18n: vi.fn(),
}));

describe("HowItWorks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useI18n as ReturnType<typeof vi.fn>).mockReturnValue({
      t: {
        home: {
          howItWorksTitle: "How It Works",
          howItWorksStep1Title: "Answer Questions",
          howItWorksStep1Description: "Answer simple questions about your situation",
          howItWorksStep2Title: "Get Results",
          howItWorksStep2Description: "Get instant results with legal citations from BGB",
          howItWorksStep3Title: "Download PDF",
          howItWorksStep3Description: "Download your personalized PDF document",
          howItWorksStep4Title: "Take Action",
          howItWorksStep4Description: "Take informed action with confidence",
        },
      },
    });
  });

  it("renders title", () => {
    render(<HowItWorks />);
    expect(screen.getByText("How It Works")).toBeInTheDocument();
  });

  it("renders all 4 steps", () => {
    render(<HowItWorks />);
    expect(screen.getByText("Answer Questions")).toBeInTheDocument();
    expect(screen.getByText("Get Results")).toBeInTheDocument();
    expect(screen.getByText("Download PDF")).toBeInTheDocument();
    expect(screen.getByText("Take Action")).toBeInTheDocument();
  });

  it("renders step descriptions", () => {
    render(<HowItWorks />);
    expect(screen.getByText("Answer simple questions about your situation")).toBeInTheDocument();
    expect(
      screen.getByText("Get instant results with legal citations from BGB")
    ).toBeInTheDocument();
    expect(screen.getByText("Download your personalized PDF document")).toBeInTheDocument();
    expect(screen.getByText("Take informed action with confidence")).toBeInTheDocument();
  });

  it("renders step icons", () => {
    const { container } = render(<HowItWorks />);
    const svgElements = container.querySelectorAll("svg");
    expect(svgElements.length).toBeGreaterThan(0);
  });
});
