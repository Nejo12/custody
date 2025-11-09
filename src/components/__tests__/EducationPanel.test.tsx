import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import EducationPanel, { type EducationItem } from "../EducationPanel";
import { useI18n } from "@/i18n";

vi.mock("@/i18n", () => ({
  useI18n: vi.fn(),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("EducationPanel", () => {
  const mockItem: EducationItem = {
    title: "Test Question",
    why: "This is why it matters",
    law: "This is what the law says",
    unsure: "This is what you can do",
    citations: [
      { label: "Source 1", url: "https://example.com/1" },
      { label: "Source 2", url: "https://example.com/2", snapshotId: "snap-123" },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useI18n as ReturnType<typeof vi.fn>).mockReturnValue({
      t: {
        education: {
          headings: {
            why: "Why this question matters",
            law: "What the law says",
            unsure: "What you can do if you're not sure",
            sources: "Sources",
          },
        },
      },
    });
  });

  it("renders title", () => {
    render(<EducationPanel item={mockItem} />);
    expect(screen.getByText("Test Question")).toBeInTheDocument();
  });

  it("renders content when open", () => {
    render(<EducationPanel item={mockItem} />);
    expect(screen.getByText("This is why it matters")).toBeInTheDocument();
    expect(screen.getByText("This is what the law says")).toBeInTheDocument();
    expect(screen.getByText("This is what you can do")).toBeInTheDocument();
  });

  it("toggles content when button clicked", () => {
    render(<EducationPanel item={mockItem} />);
    const button = screen.getByText("Test Question").closest("button");
    expect(button).toBeInTheDocument();

    fireEvent.click(button!);
    expect(screen.queryByText("This is why it matters")).not.toBeInTheDocument();

    fireEvent.click(button!);
    expect(screen.getByText("This is why it matters")).toBeInTheDocument();
  });

  it("renders citations when provided", () => {
    render(<EducationPanel item={mockItem} />);
    expect(screen.getByText("Source 1")).toBeInTheDocument();
    expect(screen.getByText("Source 2")).toBeInTheDocument();
    expect(screen.getByText("(snap-123)")).toBeInTheDocument();
  });

  it("renders citations as links", () => {
    render(<EducationPanel item={mockItem} />);
    const link1 = screen.getByText("Source 1").closest("a");
    expect(link1).toHaveAttribute("href", "https://example.com/1");
    expect(link1).toHaveAttribute("target", "_blank");
    expect(link1).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("handles item without citations", () => {
    const itemWithoutCitations: EducationItem = {
      ...mockItem,
      citations: [],
    };
    render(<EducationPanel item={itemWithoutCitations} />);
    expect(screen.queryByText("Sources")).not.toBeInTheDocument();
  });

  it("uses default headings when education headings not provided", () => {
    (useI18n as ReturnType<typeof vi.fn>).mockReturnValue({
      t: {},
    });
    render(<EducationPanel item={mockItem} />);
    expect(screen.getByText("Why this question matters")).toBeInTheDocument();
  });

  it("renders citation with url as label when label missing", () => {
    const itemWithUrlOnly: EducationItem = {
      ...mockItem,
      citations: [{ url: "https://example.com/3" }],
    };
    render(<EducationPanel item={itemWithUrlOnly} />);
    expect(screen.getByText("https://example.com/3")).toBeInTheDocument();
  });
});
