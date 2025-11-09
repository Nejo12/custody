"use client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/i18n";
import guidesData from "@/data/guides.json";
import { use, useMemo } from "react";

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
  const { t } = useI18n();
  const guides = guidesData.guides as Guide[];
  const guide = guides.find((g) => g.slug === slug);

  if (!guide) {
    notFound();
  }

  const categories = {
    "legal-process": "Legal Process",
    practical: "Practical Guides",
  };

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
          <h2 key={`h2-${idx}`} className="text-xl font-semibold mt-6 mb-3">
            {line.replace("## ", "")}
          </h2>
        );
      } else if (line.startsWith("### ")) {
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
          <h3 key={`h3-${idx}`} className="text-lg font-semibold mt-4 mb-2">
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
              className={`${listType === "ol" ? "list-decimal" : "list-disc"} list-inside mb-3 space-y-1 ml-4`}
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
              className={`${listType === "ol" ? "list-decimal" : "list-disc"} list-inside mb-3 space-y-1 ml-4`}
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
          <p key={`p-${idx}`} className="mb-3">
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
    <article className="w-full max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <Link
          href="/guides"
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline mb-4 inline-block"
        >
          {t.guides?.backToGuides || "← Back to Guides"}
        </Link>
        <h1 className="text-2xl font-semibold mb-2">{guide.title}</h1>
        <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          <span className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800">
            {categories[guide.category as keyof typeof categories] || guide.category}
          </span>
          <span>{guide.readTime}</span>
          <span>{new Date(guide.published).toLocaleDateString()}</span>
        </div>
        <p className="text-zinc-700 dark:text-zinc-300 mb-6">{guide.excerpt}</p>
      </div>

      <div className="prose prose-zinc dark:prose-invert max-w-none">
        <div className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
          {renderedContent}
        </div>
      </div>

      <div className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-4 text-sm text-zinc-700 dark:text-zinc-300">
        <p>
          {t.guides?.disclaimer ||
            "Disclaimer: This guide provides general information only, not individualized legal advice. Consult a qualified family law attorney for advice specific to your situation."}
        </p>
      </div>
    </article>
  );
}
