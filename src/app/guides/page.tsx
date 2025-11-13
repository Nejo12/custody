"use client";
import Link from "next/link";
import { useI18n } from "@/i18n";
import { useState, useEffect } from "react";
import guidesDataEn from "@/data/guides.json";
import { formatDate } from "@/lib/utils";

// Lazy load locale-specific guides data
const loadGuides = async (locale: string) => {
  try {
    switch (locale) {
      case "de":
        return (await import("@/data/guides.de.json")).default;
      case "ar":
        return (await import("@/data/guides.ar.json")).default;
      case "pl":
        return (await import("@/data/guides.pl.json")).default;
      case "fr":
        return (await import("@/data/guides.fr.json")).default;
      case "tr":
        return (await import("@/data/guides.tr.json")).default;
      case "ru":
        return (await import("@/data/guides.ru.json")).default;
      default:
        return guidesDataEn;
    }
  } catch {
    return guidesDataEn;
  }
};

type Guide = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  published: string;
  readTime: string;
};

export default function GuidesPage() {
  const { t, locale } = useI18n();
  const [guidesData, setGuidesData] = useState(guidesDataEn);

  useEffect(() => {
    loadGuides(locale).then((data) => setGuidesData(data));
  }, [locale]);

  const guides = guidesData.guides as Guide[];

  const categories = {
    "legal-process": t.guides?.categories?.legalProcess || "Legal Process",
    practical: t.guides?.categories?.practical || "Practical Guides",
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2 text-zinc-900 dark:text-zinc-50">
          {t.guides?.title || "Legal Guides"}
        </h1>
        <p className="text-sm text-zinc-700 dark:text-zinc-400">
          {t.guides?.description ||
            "Step-by-step guides to help you navigate custody and contact rights in Germany."}
        </p>
      </div>

      <div className="space-y-6">
        {guides.map((guide) => (
          <Link key={guide.slug} href={`/guides/${guide.slug}`} className="group block">
            <article className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-700 p-5 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all hover:scale-[1.01] cursor-pointer">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors block mb-2">
                    {guide.title}
                  </h2>
                  <p className="text-sm text-zinc-700 dark:text-zinc-400 mb-3">{guide.excerpt}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                <span className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800">
                  {categories[guide.category as keyof typeof categories] || guide.category}
                </span>
                <span className="text-zinc-600">{guide.readTime}</span>
                <span className="text-zinc-600">{formatDate(guide.published)}</span>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {t.guides?.languageNote && (
        <div className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-blue-50 dark:bg-blue-900/20 p-4 text-sm text-zinc-700 dark:text-zinc-500">
          <p>{t.guides.languageNote}</p>
        </div>
      )}
      <div className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-4 text-sm text-zinc-700 dark:text-zinc-500">
        <p>
          {t.guides?.note ||
            "Note: These guides provide general information only. For legal advice specific to your situation, consult a qualified family law attorney."}
        </p>
      </div>
    </div>
  );
}
