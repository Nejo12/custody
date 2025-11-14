"use client";
import { useState, useMemo, useEffect } from "react";
import { useI18n } from "@/i18n";
import glossaryDataEn from "@/data/glossary.json";

// Lazy load locale-specific glossary data
const loadGlossary = async (locale: string) => {
  try {
    switch (locale) {
      case "de":
        return (await import("@/data/glossary.de.json")).default;
      case "ar":
        return (await import("@/data/glossary.ar.json")).default;
      case "pl":
        return (await import("@/data/glossary.pl.json")).default;
      case "fr":
        return (await import("@/data/glossary.fr.json")).default;
      case "tr":
        return (await import("@/data/glossary.tr.json")).default;
      case "ru":
        return (await import("@/data/glossary.ru.json")).default;
      default:
        return glossaryDataEn;
    }
  } catch {
    return glossaryDataEn;
  }
};

type GlossaryTerm = {
  term: string;
  fullForm?: string;
  english: string;
  definition: string;
  context: string;
  citation?: string;
};

export default function GlossaryPage() {
  const { t, locale } = useI18n();
  const [search, setSearch] = useState("");
  const [glossaryData, setGlossaryData] = useState(glossaryDataEn);

  useEffect(() => {
    loadGlossary(locale).then((data) => setGlossaryData(data));
  }, [locale]);

  const terms = glossaryData.terms as GlossaryTerm[];

  const filtered = useMemo(() => {
    if (!search.trim()) return terms;
    const query = search.toLowerCase();
    return terms.filter(
      (term) =>
        term.term.toLowerCase().includes(query) ||
        term.english.toLowerCase().includes(query) ||
        term.definition.toLowerCase().includes(query) ||
        (term.fullForm && term.fullForm.toLowerCase().includes(query))
    );
  }, [search, terms]);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2 text-zinc-900 dark:text-zinc-50">
          {t.glossary?.title || "Glossary of Custody Terms"}
        </h1>
        <p className="text-sm text-zinc-700 dark:text-zinc-400">
          {t.glossary?.description || "German legal terms explained in simple language."}
        </p>
      </div>

      <div>
        <input
          type="text"
          placeholder={t.glossary?.searchPlaceholder || "Search terms..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-zinc-500 dark:text-zinc-400 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
        />
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-zinc-700 dark:text-zinc-400">
            {t.glossary?.noResults?.replace("{query}", search) ||
              `No terms found matching "${search}"`}
          </div>
        ) : (
          filtered.map((term, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      {term.term}
                    </h2>
                    {term.fullForm && (
                      <span className="text-sm text-zinc-500 dark:text-zinc-400 italic">
                        ({term.fullForm})
                      </span>
                    )}
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-500">
                      {term.english}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-sm text-zinc-800 dark:text-zinc-300 space-y-2">
                <p>
                  <strong>{t.glossary?.definition || "Definition"}:</strong> {term.definition}
                </p>
                <p>
                  <strong>{t.glossary?.inContext || "In context"}:</strong> {term.context}
                </p>
              </div>

              {term.citation && (
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <a
                    href={term.citation}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {t.glossary?.legalSource || "Legal source"} →
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="text-xs text-zinc-500 dark:text-zinc-400 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <p>
          {t.glossary?.note ||
            "Note: This glossary provides general explanations. For legal advice specific to your situation, consult a qualified family law attorney."}
        </p>
      </div>
    </div>
  );
}
