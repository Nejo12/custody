"use client";
import { useState } from "react";
import { useI18n } from "@/i18n";
import faqData from "@/data/faq.json";

type FAQCategory = {
  id: string;
  title: string;
  questions: Array<{
    question: string;
    answer: string;
  }>;
};

export default function FAQPage() {
  const { t } = useI18n();
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const categories = faqData.categories as FAQCategory[];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-2">
          {t.faq?.title || "Frequently Asked Questions"}
        </h1>
        <p className="text-sm text-zinc-700 dark:text-zinc-400">
          {t.faq?.description ||
            "Common questions about custody rights, the legal process, and using Custody Clarity."}
        </p>
      </div>

      {categories.map((category) => (
        <div key={category.id} className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
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
                  <summary className="px-4 py-3 cursor-pointer font-medium text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                    {item.question}
                  </summary>
                  <div className="px-4 pb-3 pt-2 text-sm text-zinc-700 dark:text-zinc-300 border-t border-zinc-200 dark:border-zinc-800">
                    {item.answer}
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      ))}

      <div className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-4 text-sm text-zinc-700 dark:text-zinc-300">
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
