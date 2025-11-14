"use client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/i18n";
import guidesDataEn from "@/data/guides.json";
import { formatDate } from "@/lib/utils";
import { use, useMemo, useState, useEffect } from "react";
import { useScrollThreshold } from "@/lib/hooks";

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
  content: string;
};

type Props = {
  params: Promise<{ slug: string }>;
};

export default function GuidePage({ params }: Props) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const { t, locale } = useI18n();
  const [guidesData, setGuidesData] = useState(guidesDataEn);
  const showFloatingButton = useScrollThreshold(200);

  useEffect(() => {
    loadGuides(locale).then((data) => setGuidesData(data));
  }, [locale]);

  const guides = guidesData.guides as Guide[];
  const guide = guides.find((g) => g.slug === slug);

  if (!guide) {
    notFound();
  }

  const categories = {
    "legal-process": t.guides?.categories?.legalProcess || "Legal Process",
    practical: t.guides?.categories?.practical || "Practical Guides",
  };

  const formattedDate = formatDate(guide.published);

  // Simple markdown-like rendering
  const renderedContent = useMemo(() => {
    const lines = guide.content.split("\n");
    const elements: React.ReactNode[] = [];
    let currentList: string[] = [];
    let listType: "ul" | "ol" | null = null;

    lines.forEach((line, idx) => {
      if (line.startsWith("## ")) {
        if (currentList.length > 0) {
          const ListTag = listType === "ol" ? "ol" : "ul";
          elements.push(
            <ListTag key={`list-${idx}`} className="list-disc list-inside mb-3 space-y-1 ml-4">
              {currentList.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ListTag>
          );
          currentList = [];
          listType = null;
        }
        elements.push(
          <h2
            key={`h2-${idx}`}
            className="text-xl font-semibold mt-6 mb-3 text-zinc-900 dark:text-zinc-300"
          >
            {line.replace("## ", "")}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        if (currentList.length > 0) {
          const ListTag = listType === "ol" ? "ol" : "ul";
          elements.push(
            <ListTag
              key={`list-${idx}`}
              className="list-disc list-inside mb-3 space-y-1 ml-4 text-zinc-700 dark:text-zinc-300"
            >
              {currentList.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ListTag>
          );
          currentList = [];
          listType = null;
        }
        elements.push(
          <h3
            key={`h3-${idx}`}
            className="text-lg font-semibold mt-4 mb-2 text-zinc-900 dark:text-zinc-300"
          >
            {line.replace("### ", "")}
          </h3>
        );
      } else if (line.startsWith("- ")) {
        if (listType !== "ul") {
          if (listType === "ol" && currentList.length > 0) {
            elements.push(
              <ol key={`list-${idx}`} className="list-decimal list-inside mb-3 space-y-1 ml-4">
                {currentList.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ol>
            );
            currentList = [];
          }
          listType = "ul";
        }
        currentList.push(line.replace("- ", ""));
      } else if (line.match(/^\d+\. /)) {
        if (listType !== "ol") {
          if (listType === "ul" && currentList.length > 0) {
            elements.push(
              <ul key={`list-${idx}`} className="list-disc list-inside mb-3 space-y-1 ml-4">
                {currentList.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            );
            currentList = [];
          }
          listType = "ol";
        }
        currentList.push(line.replace(/^\d+\. /, ""));
      } else if (line.trim() === "") {
        if (currentList.length > 0) {
          const ListTag = listType === "ol" ? "ol" : "ul";
          elements.push(
            <ListTag
              key={`list-${idx}`}
              className={`${listType === "ol" ? "list-decimal" : "list-disc"} list-inside mb-3 space-y-1 ml-4 text-zinc-700 dark:text-zinc-300`}
            >
              {currentList.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ListTag>
          );
          currentList = [];
          listType = null;
        }
        elements.push(<br key={`br-${idx}`} />);
      } else if (line.trim()) {
        if (currentList.length > 0) {
          const ListTag = listType === "ol" ? "ol" : "ul";
          elements.push(
            <ListTag
              key={`list-${idx}`}
              className={`${listType === "ol" ? "list-decimal" : "list-disc"} list-inside mb-3 space-y-1 ml-4 text-zinc-700 dark:text-zinc-300`}
            >
              {currentList.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ListTag>
          );
          currentList = [];
          listType = null;
        }
        elements.push(
          <p key={`p-${idx}`} className="mb-3 text-zinc-700 dark:text-zinc-300">
            {line}
          </p>
        );
      }
    });

    if (currentList.length > 0) {
      const ListTag = listType === "ol" ? "ol" : "ul";
      elements.push(
        <ListTag
          key="list-final"
          className={`${listType === "ol" ? "list-decimal" : "list-disc"} list-inside mb-3 space-y-1 ml-4`}
        >
          {currentList.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ListTag>
      );
    }

    return elements;
  }, [guide.content]);

  return (
    <>
      <article className="w-full max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div>
          <Link
            href="/guides"
            className="text-sm text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors mb-4 inline-block"
          >
            {t.guides?.backToGuides || "← Back to Guides"}
          </Link>
          <h1 className="text-2xl font-semibold mb-2 text-zinc-900 dark:text-zinc-50">
            {guide.title}
          </h1>
          <div className="flex items-center gap-4 text-sm mb-4">
            <span className="px-2 py-1 rounded bg-zinc-800 dark:bg-zinc-600 text-zinc-100 dark:text-zinc-100">
              {categories[guide.category as keyof typeof categories] || guide.category}
            </span>
            <span className="text-zinc-700 dark:text-zinc-300">{guide.readTime}</span>
            <span className="text-zinc-700 dark:text-zinc-300">{formattedDate}</span>
          </div>
          <p className="text-zinc-700 dark:text-zinc-300 mb-6">{guide.excerpt}</p>
        </div>

        {t.guides?.languageNote && (
          <div className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-blue-50 dark:bg-blue-900/20 p-4 text-sm text-zinc-800 dark:text-zinc-300">
            <p>{t.guides.languageNote}</p>
          </div>
        )}

        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <div className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {renderedContent}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 p-4 text-sm text-zinc-800 dark:text-zinc-100">
          <p>
            {t.guides?.disclaimer ||
              "Disclaimer: This guide provides general information only, not individualized legal advice. Consult a qualified family law attorney for advice specific to your situation."}
          </p>
        </div>
      </article>

      {showFloatingButton && (
        <Link
          href="/guides"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg shadow-lg hover:bg-zinc-700 dark:hover:bg-zinc-600 hover:text-zinc-100 transition-all duration-300 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium hover:shadow-xl"
          aria-label={t.guides?.backToGuides || "Back to Guides"}
        >
          <svg
            className="w-3.5 h-3.5 sm:w-4 sm:h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span className="hidden sm:inline">
            {(t.guides?.backToGuides || "← Back to Guides").replace("← ", "")}
          </span>
          <span className="sm:hidden">Back</span>
        </Link>
      )}
    </>
  );
}
