"use client";
import { useI18n } from "@/i18n";
import { useEffect, useState } from "react";

/**
 * Datenschutz (Privacy Policy) Page
 *
 * Displays privacy policy and GDPR compliance information.
 * Uses client-side mounting guard to prevent hydration mismatches
 * with i18n translations loaded from localStorage.
 */
export default function DatenschutzPage() {
  const { t } = useI18n();

  // Track mounted state to prevent hydration mismatch
  // Only render content after client-side hydration is complete
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // This is a valid pattern for tracking component mount state after hydration
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  // During SSR and initial hydration, render a minimal skeleton
  // This prevents content flash when locale loads from localStorage
  if (!isMounted) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded" />
        <div className="space-y-4">
          <div className="h-4 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded" />
          <div className="h-4 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded" />
          <div className="h-4 w-2/3 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-500">
        {t.datenschutz?.title || "Datenschutzerklärung"}
      </h1>

      <section className="space-y-4 text-sm text-zinc-900 dark:text-zinc-500">
        <div>
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-400 mb-2">
            {t.datenschutz?.section1Title || "1. Datenschutz auf einen Blick"}
          </h2>
          <h3 className="font-medium text-zinc-900 dark:text-zinc-400 mt-3 mb-2">
            {t.datenschutz?.generalNotes || "Allgemeine Hinweise"}
          </h3>
          <p>
            {t.datenschutz?.generalNotesText ||
              "Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können."}
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-300 mb-2">
            {t.datenschutz?.section2Title || "2. Verantwortliche Stelle"}
          </h2>
          <p>
            {t.datenschutz?.responsiblePartyText ||
              "Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:"}
          </p>
          <p className="mt-2">
            <strong>Olaniyi Gabriel, Aborisade</strong>
            <br />
            <strong>12459 Berlin, Germany.</strong>
            <br />
            <strong>{t.datenschutz?.email || "E-Mail:"}</strong>{" "}
            <a
              href="mailto:contact@custodyclarity.com"
              className="underline text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              contact@custodyclarity.com
            </a>
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-300 mb-2">
            {t.datenschutz?.section3Title || "3. Datenerfassung auf dieser Website"}
          </h2>
          <h3 className="font-medium text-zinc-900 dark:text-zinc-300 mt-3 mb-2">
            {t.datenschutz?.serverLogFiles || "Server-Log-Dateien"}
          </h3>
          <p>
            {t.datenschutz?.serverLogFilesText ||
              "Der Provider der Seiten erhebt und speichert automatisch Informationen in sogenannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:"}
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
            {(
              t.datenschutz?.serverLogItems || [
                "Browsertyp und Browserversion",
                "verwendetes Betriebssystem",
                "Referrer URL",
                "Hostname des zugreifenden Rechners",
                "Uhrzeit der Serveranfrage",
                "IP-Adresse",
              ]
            ).map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
          <p className="mt-2">
            {t.datenschutz?.serverLogFilesNote ||
              "Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen. Die Erfassung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO."}
          </p>

          <h3 className="font-medium text-zinc-900 dark:text-zinc-300 mt-3 mb-2">
            {t.datenschutz?.contactForm || "Kontaktformular"}
          </h3>
          <p>
            {t.datenschutz?.contactFormText ||
              "Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter."}
          </p>

          <h3 className="font-medium text-zinc-900 dark:text-zinc-300 mt-3 mb-2">
            {t.datenschutz?.localStorage || "Lokale Speicherung (LocalStorage)"}
          </h3>
          <p>
            {t.datenschutz?.localStorageText ||
              "Diese Website verwendet LocalStorage, um Ihre Präferenzen (z. B. Spracheinstellungen, Theme-Einstellungen) lokal in Ihrem Browser zu speichern. Diese Daten werden nur auf Ihrem Gerät gespeichert und nicht an Server übertragen."}
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-300 mb-2">
            {t.datenschutz?.section4Title || "4. Ihre Rechte"}
          </h2>
          <p>{t.datenschutz?.yourRightsText || "Sie haben jederzeit das Recht:"}</p>
          <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
            {(
              t.datenschutz?.yourRightsItems || [
                "Auskunft über Ihre bei uns gespeicherten personenbezogenen Daten zu erhalten (Art. 15 DSGVO)",
                "Berichtigung unrichtiger Daten zu verlangen (Art. 16 DSGVO)",
                "Löschung Ihrer bei uns gespeicherten Daten zu verlangen (Art. 17 DSGVO)",
                "Einschränkung der Datenverarbeitung zu verlangen (Art. 18 DSGVO)",
                "Widerspruch gegen die Verarbeitung Ihrer Daten einzulegen (Art. 21 DSGVO)",
                "Datenübertragbarkeit zu verlangen (Art. 20 DSGVO)",
              ]
            ).map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-300 mb-2">
            {t.datenschutz?.section5Title || "5. Widerspruch gegen Datenverarbeitung"}
          </h2>
          <p>
            {t.datenschutz?.objectionText ||
              "Sie haben das Recht, aus Gründen, die sich aus Ihrer besonderen Situation ergeben, jederzeit gegen die Verarbeitung Sie betreffender personenbezogener Daten, die aufgrund von Art. 6 Abs. 1 lit. f DSGVO erfolgt, Widerspruch einzulegen."}
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-300 mb-2">
            {t.datenschutz?.section6Title || "6. Änderung dieser Datenschutzerklärung"}
          </h2>
          <p>
            {t.datenschutz?.changesText ||
              "Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen in der Datenschutzerklärung umzusetzen."}
          </p>
        </div>
      </section>
    </div>
  );
}
