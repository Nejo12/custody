"use client";
import { useI18n } from "@/i18n";

export default function ImpressumPage() {
  const { t } = useI18n();

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
        {t.impressum?.title || "Impressum"}
      </h1>

      <section className="space-y-4 text-sm text-zinc-700 dark:text-zinc-300">
        <div>
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
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
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            {t.impressum?.contact || "Kontakt"}
          </h2>
          <p>
            {t.impressum?.email || "E-Mail:"} {/* TODO: Replace with actual email */}
            <a
              href="mailto:contact@custodyclarity.com"
              className="underline text-blue-600 dark:text-blue-400 ml-1"
            >
              contact@custodyclarity.com
            </a>
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            {t.impressum?.liabilityDisclaimer || "Haftungsausschluss"}
          </h2>
          <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mt-3 mb-2">
            {t.impressum?.liabilityContent || "Haftung für Inhalte"}
          </h3>
          <p>
            {t.impressum?.liabilityContentText ||
              "Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich."}
          </p>

          <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mt-3 mb-2">
            {t.impressum?.liabilityLinks || "Haftung für Links"}
          </h3>
          <p>
            {t.impressum?.liabilityLinksText ||
              "Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich."}
          </p>

          <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mt-3 mb-2">
            {t.impressum?.copyright || "Urheberrecht"}
          </h3>
          <p>
            {t.impressum?.copyrightText ||
              "Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers."}
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
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
