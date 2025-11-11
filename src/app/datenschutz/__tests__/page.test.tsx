import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import DatenschutzPage from "../page";

/**
 * Mock the i18n module to avoid localStorage issues in tests
 */
vi.mock("@/i18n", () => ({
  useI18n: () => ({
    locale: "de",
    t: {
      datenschutz: {
        title: "Datenschutzerklärung",
        section1Title: "1. Datenschutz auf einen Blick",
        generalNotes: "Allgemeine Hinweise",
        generalNotesText:
          "Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.",
        section2Title: "2. Verantwortliche Stelle",
        responsiblePartyText:
          "Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:",
        email: "E-Mail:",
        section3Title: "3. Datenerfassung auf dieser Website",
        serverLogFiles: "Server-Log-Dateien",
        serverLogFilesText:
          "Der Provider der Seiten erhebt und speichert automatisch Informationen in sogenannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:",
        serverLogItems: [
          "Browsertyp und Browserversion",
          "verwendetes Betriebssystem",
          "Referrer URL",
          "Hostname des zugreifenden Rechners",
          "Uhrzeit der Serveranfrage",
          "IP-Adresse",
        ],
        serverLogFilesNote:
          "Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen. Die Erfassung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.",
        contactForm: "Kontaktformular",
        contactFormText:
          "Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.",
        localStorage: "Lokale Speicherung (LocalStorage)",
        localStorageText:
          "Diese Website verwendet LocalStorage, um Ihre Präferenzen (z. B. Spracheinstellungen, Theme-Einstellungen) lokal in Ihrem Browser zu speichern. Diese Daten werden nur auf Ihrem Gerät gespeichert und nicht an Server übertragen.",
        section4Title: "4. Ihre Rechte",
        yourRightsText: "Sie haben jederzeit das Recht:",
        yourRightsItems: [
          "Auskunft über Ihre bei uns gespeicherten personenbezogenen Daten zu erhalten (Art. 15 DSGVO)",
          "Berichtigung unrichtiger Daten zu verlangen (Art. 16 DSGVO)",
          "Löschung Ihrer bei uns gespeicherten Daten zu verlangen (Art. 17 DSGVO)",
          "Einschränkung der Datenverarbeitung zu verlangen (Art. 18 DSGVO)",
          "Widerspruch gegen die Verarbeitung Ihrer Daten einzulegen (Art. 21 DSGVO)",
          "Datenübertragbarkeit zu verlangen (Art. 20 DSGVO)",
        ],
        section5Title: "5. Widerspruch gegen Datenverarbeitung",
        objectionText:
          "Sie haben das Recht, aus Gründen, die sich aus Ihrer besonderen Situation ergeben, jederzeit gegen die Verarbeitung Sie betreffender personenbezogener Daten, die aufgrund von Art. 6 Abs. 1 lit. f DSGVO erfolgt, Widerspruch einzulegen.",
        section6Title: "6. Änderung dieser Datenschutzerklärung",
        changesText:
          "Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen in der Datenschutzerklärung umzusetzen.",
      },
    },
    setLocale: vi.fn(),
  }),
}));

/**
 * Tests for Datenschutz (Privacy Policy) Page
 */
describe("DatenschutzPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render full content after mounting", async () => {
    render(<DatenschutzPage />);

    // Wait for content to appear after mounting
    await waitFor(() => {
      expect(screen.getByText("Datenschutzerklärung")).toBeInTheDocument();
    });

    // Verify main sections are rendered
    expect(screen.getByText("1. Datenschutz auf einen Blick")).toBeInTheDocument();
    expect(screen.getByText("2. Verantwortliche Stelle")).toBeInTheDocument();
    expect(screen.getByText("3. Datenerfassung auf dieser Website")).toBeInTheDocument();
  });

  it("should display contact information", async () => {
    render(<DatenschutzPage />);

    await waitFor(() => {
      expect(screen.getByText("Olaniyi Gabriel, Aborisade")).toBeInTheDocument();
    });

    // Verify email link
    const emailLink = screen.getByRole("link", { name: /contact@custodyclarity.com/i });
    expect(emailLink).toHaveAttribute("href", "mailto:contact@custodyclarity.com");
  });

  it("should display server log files information", async () => {
    render(<DatenschutzPage />);

    await waitFor(() => {
      expect(screen.getByText("Server-Log-Dateien")).toBeInTheDocument();
    });

    // Verify server log items are listed
    expect(screen.getByText(/Browsertyp und Browserversion/i)).toBeInTheDocument();
    expect(screen.getByText(/verwendetes Betriebssystem/i)).toBeInTheDocument();
    expect(screen.getByText(/IP-Adresse/i)).toBeInTheDocument();
  });

  it("should display user rights section", async () => {
    render(<DatenschutzPage />);

    await waitFor(() => {
      expect(screen.getByText("4. Ihre Rechte")).toBeInTheDocument();
    });

    expect(screen.getByText("Sie haben jederzeit das Recht:")).toBeInTheDocument();

    // Verify GDPR rights are listed
    expect(screen.getByText(/Art. 15 DSGVO/i)).toBeInTheDocument();
    expect(screen.getByText(/Art. 16 DSGVO/i)).toBeInTheDocument();
    expect(screen.getByText(/Art. 17 DSGVO/i)).toBeInTheDocument();
  });

  it("should display localStorage information", async () => {
    render(<DatenschutzPage />);

    await waitFor(() => {
      expect(screen.getByText("Lokale Speicherung (LocalStorage)")).toBeInTheDocument();
    });

    expect(screen.getByText(/Diese Website verwendet LocalStorage/i)).toBeInTheDocument();
  });

  it("should display all 6 main sections", async () => {
    render(<DatenschutzPage />);

    await waitFor(() => {
      expect(screen.getByText("1. Datenschutz auf einen Blick")).toBeInTheDocument();
    });

    expect(screen.getByText("2. Verantwortliche Stelle")).toBeInTheDocument();
    expect(screen.getByText("3. Datenerfassung auf dieser Website")).toBeInTheDocument();
    expect(screen.getByText("4. Ihre Rechte")).toBeInTheDocument();
    expect(screen.getByText("5. Widerspruch gegen Datenverarbeitung")).toBeInTheDocument();
    expect(screen.getByText("6. Änderung dieser Datenschutzerklärung")).toBeInTheDocument();
  });

  it("should have proper accessibility structure", async () => {
    render(<DatenschutzPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 1, name: /datenschutzerklärung/i })
      ).toBeInTheDocument();
    });

    // Verify heading hierarchy
    const h2Headings = screen.getAllByRole("heading", { level: 2 });
    expect(h2Headings.length).toBeGreaterThan(0);
  });

  it("should render lists with proper structure", async () => {
    const { container } = render(<DatenschutzPage />);

    await waitFor(() => {
      expect(screen.getByText("Server-Log-Dateien")).toBeInTheDocument();
    });

    // Verify unordered lists exist
    const lists = container.querySelectorAll("ul");
    expect(lists.length).toBeGreaterThan(0);

    // Verify list items exist
    const listItems = container.querySelectorAll("li");
    expect(listItems.length).toBeGreaterThan(0);
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

    const { unmount } = render(<DatenschutzPage />);

    await waitFor(() => {
      // Should fall back to default German text
      expect(screen.getByText("Datenschutzerklärung")).toBeInTheDocument();
    });

    unmount();
  });

  it("should apply correct CSS classes for styling", async () => {
    const { container } = render(<DatenschutzPage />);

    await waitFor(() => {
      expect(screen.getByText("Datenschutzerklärung")).toBeInTheDocument();
    });

    // Verify main container has proper classes
    const mainDiv = container.querySelector(".max-w-2xl");
    expect(mainDiv).toBeInTheDocument();
    expect(mainDiv).toHaveClass("mx-auto", "px-4", "py-8");
  });

  it("should display GDPR compliance information", async () => {
    render(<DatenschutzPage />);

    await waitFor(() => {
      // Use getAllByText since there are multiple elements with this text
      const gdprReferences = screen.getAllByText(/Art. 6 Abs. 1 lit. f DSGVO/i);
      expect(gdprReferences.length).toBeGreaterThan(0);
    });

    // Verify multiple GDPR references
    const gdprReferences = screen.getAllByText(/DSGVO/i);
    expect(gdprReferences.length).toBeGreaterThan(1);
  });
});
