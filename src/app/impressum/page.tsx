"use client";
import { useI18n } from "@/i18n";
import { useEffect, useState } from "react";

/**
 * Impressum (Legal Notice) Page
 *
 * Displays legal information required under German law (§ 5 TMG).
 * Uses client-side mounting guard to prevent hydration mismatches
 * with i18n translations loaded from localStorage.
 */
export default function ImpressumPage() {
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
        <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded" />
        <div className="space-y-4">
          <div className="h-4 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded" />
          <div className="h-4 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded" />
          <div className="h-4 w-3/4 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {t.impressum?.title || "Impressum"}
      </h1>

      <section className="space-y-4 text-sm text-zinc-900 dark:text-zinc-300">
        <div>
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-300 mb-2">
            {t.impressum?.section1Title || "Angaben gemäß § 5 TMG"}
          </h2>
          <p>
            <strong>
              {t.impressum?.responsible || "Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:"}
            </strong>
          </p>
          <p className="mt-2">
            <strong>Olaniyi Gabriel, Aborisade</strong>
            <br />
            <strong>12459 Berlin</strong>
            <br />
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-300 mb-2">
            {t.impressum?.contact || "Kontakt"}
          </h2>
          <p>
            {t.impressum?.email || "E-Mail:"} {/* TODO: Replace with actual email */}
            <a
              href="mailto:contact@custodyclarity.com"
              className="underline text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors ml-1"
            >
              contact@custodyclarity.com
            </a>
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-300 mb-2">
            {t.impressum?.liabilityDisclaimer || "Haftungsausschluss"}
          </h2>
          <h3 className="font-medium text-zinc-900 dark:text-zinc-300 mt-3 mb-2">
            {t.impressum?.liabilityContent || "Haftung für Inhalte"}
          </h3>
          <p>
            {t.impressum?.liabilityContentText ||
              "Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich."}
          </p>

          <h3 className="font-medium text-zinc-900 dark:text-zinc-300 mt-3 mb-2">
            {t.impressum?.liabilityLinks || "Haftung für Links"}
          </h3>
          <p>
            {t.impressum?.liabilityLinksText ||
              "Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich."}
          </p>

          <h3 className="font-medium text-zinc-900 dark:text-zinc-300 mt-3 mb-2">
            {t.impressum?.copyright || "Urheberrecht"}
          </h3>
          <p>
            {t.impressum?.copyrightText ||
              "Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers."}
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-300 mb-2">
            {t.impressum?.note || "Hinweis"}
          </h2>
          <p>
            {t.impressum?.noteText ||
              "Diese Website dient ausschließlich Informationszwecken und stellt keine individuelle Rechtsberatung dar. Bei rechtlichen Fragen sollten Sie sich an einen qualifizierten Rechtsanwalt oder eine Beratungsstelle wenden."}
          </p>
        </div>
      </section>
    </div>
  );
}
