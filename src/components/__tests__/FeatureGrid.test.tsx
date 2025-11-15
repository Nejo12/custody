import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import FeatureGrid from "../FeatureGrid";
import { useI18n } from "@/i18n";

vi.mock("@/i18n", () => ({
  useI18n: vi.fn(),
}));

describe("FeatureGrid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useI18n as ReturnType<typeof vi.fn>).mockReturnValue({
      t: {
        home: {
          featuresTitle: "Why Choose Custody Clarity",
          feature6MinutesTitle: "6-Minute Interview",
          feature6MinutesDescription:
            "Quick and straightforward questions to understand your situation",
          featureLegalCitationsTitle: "Legal Citations",
          featureLegalCitationsDescription: "All results include citations from German law (BGB)",
          featurePrivacyFirstTitle: "Privacy-First",
          featurePrivacyFirstDescription:
            "Your data stays on your device. No tracking, no signup required",
          featureOfflineReadyTitle: "Offline-Ready",
          featureOfflineReadyDescription: "Works without internet connection once loaded",
          feature7LanguagesTitle: "7 Languages",
          feature7LanguagesDescription:
            "Available in English, German, Arabic, Polish, French, Turkish, and Russian",
          featureWcagAATitle: "WCAG AA Compliant",
          featureWcagAADescription:
            "Accessible to everyone, meeting international accessibility standards",
        },
      },
    });
  });

  it("renders title", () => {
    render(<FeatureGrid />);
    expect(screen.getByText("Why Choose Custody Clarity")).toBeInTheDocument();
  });

  it("renders all 6 features", () => {
    render(<FeatureGrid />);
    expect(screen.getByText("6-Minute Interview")).toBeInTheDocument();
    expect(screen.getByText("Legal Citations")).toBeInTheDocument();
    expect(screen.getByText("Privacy-First")).toBeInTheDocument();
    expect(screen.getByText("Offline-Ready")).toBeInTheDocument();
    expect(screen.getByText("7 Languages")).toBeInTheDocument();
    expect(screen.getByText("WCAG AA Compliant")).toBeInTheDocument();
  });

  it("renders feature descriptions", () => {
    render(<FeatureGrid />);
    expect(
      screen.getByText("Quick and straightforward questions to understand your situation")
    ).toBeInTheDocument();
    expect(
      screen.getByText("All results include citations from German law (BGB)")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Your data stays on your device. No tracking, no signup required")
    ).toBeInTheDocument();
  });

  it("renders feature icons", () => {
    const { container } = render(<FeatureGrid />);
    const svgElements = container.querySelectorAll("svg");
    expect(svgElements.length).toBeGreaterThan(0);
  });
});
