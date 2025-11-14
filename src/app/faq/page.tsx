"use client";
import { useState, useEffect } from "react";
import { useI18n } from "@/i18n";
import faqDataEn from "@/data/faq.json";

type FAQCategory = {
  id: string;
  title: string;
  questions: Array<{
    question: string;
    answer: string;
  }>;
};

// Lazy load locale-specific FAQ data
const loadFAQ = async (locale: string) => {
  try {
    switch (locale) {
      case "de":
        return (await import("@/data/faq.de.json")).default;
      case "ar":
        return (await import("@/data/faq.ar.json")).default;
      case "pl":
        return (await import("@/data/faq.pl.json")).default;
      case "fr":
        return (await import("@/data/faq.fr.json")).default;
      case "tr":
        return (await import("@/data/faq.tr.json")).default;
      case "ru":
        return (await import("@/data/faq.ru.json")).default;
      default:
        return faqDataEn;
    }
  } catch {
    return faqDataEn;
  }
};

export default function FAQPage() {
  const { t, locale } = useI18n();
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const [faqData, setFaqData] = useState(faqDataEn);
  const categories = faqData.categories as FAQCategory[];

  useEffect(() => {
    loadFAQ(locale).then((data) => setFaqData(data));
  }, [locale]);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-2 text-zinc-900 dark:text-zinc-50">
          {t.faq?.title || "Frequently Asked Questions"}
        </h1>
        <p className="text-sm text-zinc-700 dark:text-zinc-400">
          {t.faq?.description ||
            "Common questions about custody rights, the legal process, and using Custody Clarity."}
        </p>
      </div>

      {categories.map((category) => (
        <div key={category.id} className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {category.title}
          </h2>
          <div className="space-y-2">
            {category.questions.map((item, idx) => {
              const questionId = `${category.id}-${idx}`;
              const isOpen = openQuestion === questionId;
              return (
                <details
                  key={idx}
                  open={isOpen}
                  onToggle={(e) => {
                    setOpenQuestion(e.currentTarget.open ? questionId : null);
                  }}
                  className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                >
                  <summary className="px-4 py-3 cursor-pointer font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                    {item.question}
                  </summary>
                  <div className="px-4 pb-3 pt-2 text-sm text-zinc-700 dark:text-zinc-500 border-t border-zinc-200 dark:border-zinc-800">
                    {item.answer}
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      ))}

      <div className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-4 text-sm text-zinc-700 dark:text-zinc-500">
        <p>
          <strong>{t.faq?.stillHaveQuestions || "Still have questions?"}</strong>{" "}
          {t.faq?.checkGlossary || "Check our"}{" "}
          <a href="/glossary" className="underline text-blue-600 dark:text-blue-400">
            {t.faq?.glossaryLink || "Glossary"}
          </a>{" "}
          {t.faq?.orUseDirectory || "for explanations of legal terms, or use our"}{" "}
          <a href="/directory" className="underline text-blue-600 dark:text-blue-400">
            {t.faq?.directoryLink || "Directory"}
          </a>{" "}
          {t.faq?.toFindSupport || "to find support services in your area."}
        </p>
      </div>
    </div>
  );
}
