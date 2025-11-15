/**
 * Tests for Planning Interview Page
 * Tests the personalized checklist generator interview flow
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PlanningInterviewPage from "../interview/page";
import { useI18n } from "@/i18n";

// Mock the i18n hook
vi.mock("@/i18n", () => ({
  useI18n: vi.fn(),
}));

// Mock the checklist generator
vi.mock("@/lib/checklist-generator", () => ({
  generatePersonalizedChecklist: vi.fn(),
}));

// Mock the PDF download function
vi.mock("@/components/planning/ChecklistPDF", () => ({
  downloadChecklistPDF: vi.fn(),
}));

// Mock Next.js Link
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock InterviewForm component
vi.mock("@/components/planning/InterviewForm", () => ({
  default: ({ onComplete }: { onComplete: (situation: unknown) => void }) => (
    <div data-testid="interview-form">
      <button
        type="button"
        onClick={() => {
          onComplete({
            relationshipStatus: "unmarried",
            pregnancyStage: "first-trimester",
            hasPaternityCertificate: false,
            hasJointCustody: false,
            relationshipStable: true,
            city: "Berlin",
          });
        }}
      >
        Complete Interview
      </button>
    </div>
  ),
}));

describe("PlanningInterviewPage", () => {
  const mockT = {
    planning: {
      personalizedTool: {
        title: "Get Your Personalized Action Plan",
        description: "Answer a few questions about your situation",
        results: {
          title: "Your Personalized Action Plan",
          priorityTasks: "Priority Tasks",
          recommendedGuides: "Recommended Guides",
          localResources: "Local Resources",
          nextSteps: "Next Steps",
          downloadPDF: "Download as PDF",
        },
      },
      urgency: {
        critical: "Critical",
        high: "High Priority",
        medium: "Medium Priority",
        low: "Important",
      },
      cityResources: {
        standesamt: {
          title: "Standesamt",
        },
        jugendamt: {
          title: "Jugendamt",
        },
        phone: "Phone",
        website: "Website",
      },
      backToPlanning: "← Back to Planning",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useI18n as ReturnType<typeof vi.fn>).mockReturnValue({
      t: mockT,
    });
  });

  it("renders the interview form initially", async () => {
    render(<PlanningInterviewPage />);

    expect(screen.getByText("Get Your Personalized Action Plan")).toBeInTheDocument();
    expect(screen.getByText("Answer a few questions about your situation")).toBeInTheDocument();

    // Wait for lazy-loaded InterviewForm to load
    await waitFor(() => {
      expect(screen.getByTestId("interview-form")).toBeInTheDocument();
    });
  });

  it("shows loading state when generating checklist", async () => {
    const { generatePersonalizedChecklist } = await import("@/lib/checklist-generator");
    vi.mocked(generatePersonalizedChecklist).mockReturnValue({
      situation: {
        relationshipStatus: "unmarried",
        pregnancyStage: "first-trimester",
        hasPaternityCertificate: false,
        hasJointCustody: false,
        relationshipStable: true,
        city: "Berlin",
      },
      priorityItems: [],
      recommendedGuides: [],
      nextSteps: [],
    });

    render(<PlanningInterviewPage />);

    const completeButton = screen.getByText("Complete Interview");
    await userEvent.click(completeButton);

    // Check loading state appears
    expect(screen.getByText("Generating your personalized plan...")).toBeInTheDocument();

    // Wait for setTimeout to complete (100ms delay in component)
    await waitFor(
      () => {
        expect(screen.queryByText("Generating your personalized plan...")).not.toBeInTheDocument();
      },
      { timeout: 200 }
    );
  });

  it("displays results after interview completion", async () => {
    const { generatePersonalizedChecklist } = await import("@/lib/checklist-generator");
    const mockChecklist = {
      situation: {
        relationshipStatus: "unmarried" as const,
        pregnancyStage: "first-trimester" as const,
        hasPaternityCertificate: false,
        hasJointCustody: false,
        relationshipStable: true,
        city: "Berlin",
      },
      priorityItems: [
        {
          id: "test-item-1",
          title: "Test Priority Task",
          description: "Test description",
          stage: "expecting" as const,
          urgency: "critical" as const,
          estimatedTime: "30 minutes",
          location: "Jugendamt",
          cost: "Free",
        },
      ],
      recommendedGuides: [
        {
          slug: "test-guide",
          title: "Test Guide",
          excerpt: "Test guide excerpt",
          stage: "expecting" as const,
          urgency: "high" as const,
          published: "2025-01-01",
          readTime: "5 min read",
          content: "Test content",
        },
      ],
      cityResources: {
        city: "Berlin",
        postcode: "10115",
        standesamt: {
          name: "Standesamt Berlin-Mitte",
          address: "Test Address",
          phone: "030-123456",
          appointmentRequired: true,
        },
        jugendamt: {
          name: "Jugendamt Berlin-Mitte",
          address: "Test Address",
          phone: "030-654321",
          appointmentRequired: true,
        },
      },
      nextSteps: ["Step 1", "Step 2"],
    };

    vi.mocked(generatePersonalizedChecklist).mockReturnValue(mockChecklist);

    render(<PlanningInterviewPage />);

    const completeButton = screen.getByText("Complete Interview");
    await userEvent.click(completeButton);

    await waitFor(() => {
      expect(screen.getByText("Your Personalized Action Plan")).toBeInTheDocument();
    });

    expect(screen.getByText("Priority Tasks")).toBeInTheDocument();
    expect(screen.getByText("Test Priority Task")).toBeInTheDocument();
    expect(screen.getByText("Recommended Guides")).toBeInTheDocument();
    expect(screen.getByText("Test Guide")).toBeInTheDocument();
    expect(screen.getByText("Local Resources")).toBeInTheDocument();
    expect(screen.getByText("Next Steps")).toBeInTheDocument();
  });

  it("handles PDF download button click", async () => {
    const { generatePersonalizedChecklist } = await import("@/lib/checklist-generator");
    const { downloadChecklistPDF } = await import("@/components/planning/ChecklistPDF");

    const mockChecklist = {
      situation: {
        relationshipStatus: "unmarried" as const,
        pregnancyStage: "first-trimester" as const,
        hasPaternityCertificate: false,
        hasJointCustody: false,
        relationshipStable: true,
      },
      priorityItems: [],
      recommendedGuides: [],
      nextSteps: [],
    };

    vi.mocked(generatePersonalizedChecklist).mockReturnValue(mockChecklist);
    vi.mocked(downloadChecklistPDF).mockResolvedValue(undefined);

    render(<PlanningInterviewPage />);

    const completeButton = screen.getByText("Complete Interview");
    await userEvent.click(completeButton);

    await waitFor(() => {
      expect(screen.getByText("Your Personalized Action Plan")).toBeInTheDocument();
    });

    const downloadButton = screen.getByText("Download as PDF");
    await userEvent.click(downloadButton);

    await waitFor(() => {
      expect(downloadChecklistPDF).toHaveBeenCalledWith(mockChecklist, "en");
    });
  });

  it("handles start over button", async () => {
    const { generatePersonalizedChecklist } = await import("@/lib/checklist-generator");

    const mockChecklist = {
      situation: {
        relationshipStatus: "unmarried" as const,
        pregnancyStage: "first-trimester" as const,
        hasPaternityCertificate: false,
        hasJointCustody: false,
        relationshipStable: true,
      },
      priorityItems: [],
      recommendedGuides: [],
      nextSteps: [],
    };

    vi.mocked(generatePersonalizedChecklist).mockReturnValue(mockChecklist);

    render(<PlanningInterviewPage />);

    const completeButton = screen.getByText("Complete Interview");
    await userEvent.click(completeButton);

    await waitFor(() => {
      expect(screen.getByText("Your Personalized Action Plan")).toBeInTheDocument();
    });

    const startOverButton = screen.getByText("Start Over");
    await userEvent.click(startOverButton);

    await waitFor(() => {
      expect(screen.getByTestId("interview-form")).toBeInTheDocument();
    });
  });

  it("displays empty state when no priority items", async () => {
    const { generatePersonalizedChecklist } = await import("@/lib/checklist-generator");

    const mockChecklist = {
      situation: {
        relationshipStatus: "married" as const,
        relationshipStable: true,
        hasPaternityCertificate: false,
        hasJointCustody: false,
      },
      priorityItems: [],
      recommendedGuides: [],
      nextSteps: [],
    };

    vi.mocked(generatePersonalizedChecklist).mockReturnValue(mockChecklist);

    render(<PlanningInterviewPage />);

    const completeButton = screen.getByText("Complete Interview");
    await userEvent.click(completeButton);

    await waitFor(() => {
      expect(screen.getByText("No priority tasks found for your situation.")).toBeInTheDocument();
    });
  });

  it("renders back to planning link", () => {
    render(<PlanningInterviewPage />);

    const backLink = screen.getByText("← Back to Planning");
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest("a")).toHaveAttribute("href", "/planning");
  });

  it("renders view full checklist link in results", async () => {
    const { generatePersonalizedChecklist } = await import("@/lib/checklist-generator");

    const mockChecklist = {
      situation: {
        relationshipStatus: "unmarried" as const,
        pregnancyStage: "first-trimester" as const,
        hasPaternityCertificate: false,
        hasJointCustody: false,
        relationshipStable: true,
      },
      priorityItems: [],
      recommendedGuides: [],
      nextSteps: [],
    };

    vi.mocked(generatePersonalizedChecklist).mockReturnValue(mockChecklist);

    render(<PlanningInterviewPage />);

    const completeButton = screen.getByText("Complete Interview");
    await userEvent.click(completeButton);

    await waitFor(() => {
      const checklistLink = screen.getByText("View Full Checklist");
      expect(checklistLink).toBeInTheDocument();
      expect(checklistLink.closest("a")).toHaveAttribute("href", "/planning/checklist");
    });
  });
});
