"use client";
import Link from "next/link";
import { useI18n } from "@/i18n";
import guidesData from "@/data/guides.json";

type Guide = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  published: string;
  readTime: string;
};

export default function GuidesPage() {
  const { t } = useI18n();
  const guides = guidesData.guides as Guide[];

  const categories = {
    "legal-process": "Legal Process",
    practical: "Practical Guides",
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">{t.guides?.title || "Legal Guides"}</h1>
        <p className="text-sm text-zinc-700 dark:text-zinc-400">
          {t.guides?.description ||
            "Step-by-step guides to help you navigate custody and contact rights in Germany."}
        </p>
      </div>

      <div className="space-y-6">
        {guides.map((guide) => (
          <article
            key={guide.slug}
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <Link
                  href={`/guides/${guide.slug}`}
                  className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 hover:underline block mb-2"
                >
                  {guide.title}
                </Link>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-3">{guide.excerpt}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400">
              <span className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800">
                {categories[guide.category as keyof typeof categories] || guide.category}
              </span>
              <span>{guide.readTime}</span>
              <span>{new Date(guide.published).toLocaleDateString()}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-4 text-sm text-zinc-700 dark:text-zinc-300">
        <p>
          {t.guides?.note ||
            "Note: These guides provide general information only. For legal advice specific to your situation, consult a qualified family law attorney."}
        </p>
      </div>
    </div>
  );
}
