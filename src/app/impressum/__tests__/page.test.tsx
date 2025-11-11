import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import ImpressumPage from "../page";

/**
 * Mock the i18n module to avoid localStorage issues in tests
 */
vi.mock("@/i18n", () => ({
  useI18n: () => ({
    locale: "de",
    t: {
      impressum: {
        title: "Impressum",
        section1Title: "Angaben gemäß § 5 TMG",
        responsible: "Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:",
        contact: "Kontakt",
        email: "E-Mail:",
        liabilityDisclaimer: "Haftungsausschluss",
        liabilityContent: "Haftung für Inhalte",
        liabilityContentText:
          "Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.",
        liabilityLinks: "Haftung für Links",
        liabilityLinksText:
          "Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.",
        copyright: "Urheberrecht",
        copyrightText:
          "Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.",
        note: "Hinweis",
        noteText:
          "Diese Website dient ausschließlich Informationszwecken und stellt keine individuelle Rechtsberatung dar. Bei rechtlichen Fragen sollten Sie sich an einen qualifizierten Rechtsanwalt oder eine Beratungsstelle wenden.",
      },
    },
    setLocale: vi.fn(),
  }),
}));

/**
 * Tests for Impressum (Legal Notice) Page
 */
describe("ImpressumPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render full content after mounting", async () => {
    render(<ImpressumPage />);

    // Wait for content to appear after mounting
    await waitFor(() => {
      expect(screen.getByText("Impressum")).toBeInTheDocument();
    });

    // Verify main sections are rendered
    expect(screen.getByText("Angaben gemäß § 5 TMG")).toBeInTheDocument();
    expect(screen.getByText("Kontakt")).toBeInTheDocument();
    expect(screen.getByText("Haftungsausschluss")).toBeInTheDocument();
  });

  it("should display contact information", async () => {
    render(<ImpressumPage />);

    await waitFor(() => {
      expect(screen.getByText("Olaniyi Gabriel, Aborisade")).toBeInTheDocument();
    });

    // Verify email link
    const emailLink = screen.getByRole("link", { name: /contact@custodyclarity.com/i });
    expect(emailLink).toHaveAttribute("href", "mailto:contact@custodyclarity.com");
  });

  it("should display liability disclaimer sections", async () => {
    render(<ImpressumPage />);

    await waitFor(() => {
      expect(screen.getByText("Haftung für Inhalte")).toBeInTheDocument();
    });

    expect(screen.getByText("Haftung für Links")).toBeInTheDocument();
    expect(screen.getByText("Urheberrecht")).toBeInTheDocument();
  });

  it("should display disclaimer note", async () => {
    render(<ImpressumPage />);

    await waitFor(() => {
      expect(screen.getByText("Hinweis")).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Diese Website dient ausschließlich Informationszwecken/i)
    ).toBeInTheDocument();
  });

  it("should have proper accessibility structure", async () => {
    render(<ImpressumPage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: /impressum/i })).toBeInTheDocument();
    });

    // Verify heading hierarchy
    const h2Headings = screen.getAllByRole("heading", { level: 2 });
    expect(h2Headings.length).toBeGreaterThan(0);
  });

  it("should use fallback text when translations are missing", async () => {
    // Mock with empty translations
    vi.mock("@/i18n", () => ({
      useI18n: () => ({
        locale: "de",
        t: {},
        setLocale: vi.fn(),
      }),
    }));

    const { unmount } = render(<ImpressumPage />);

    await waitFor(() => {
      // Should fall back to default German text
      expect(screen.getByText("Impressum")).toBeInTheDocument();
    });

    unmount();
  });

  it("should apply correct CSS classes for styling", async () => {
    const { container } = render(<ImpressumPage />);

    await waitFor(() => {
      expect(screen.getByText("Impressum")).toBeInTheDocument();
    });

    // Verify main container has proper classes
    const mainDiv = container.querySelector(".max-w-2xl");
    expect(mainDiv).toBeInTheDocument();
    expect(mainDiv).toHaveClass("mx-auto", "px-4", "py-8");
  });
});
