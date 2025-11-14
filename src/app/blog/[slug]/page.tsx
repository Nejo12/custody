"use client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/i18n";
import blogData from "@/data/blog.json";
import { formatDate } from "@/lib/utils";
import { use, useMemo } from "react";
import { useScrollThreshold } from "@/lib/hooks";

type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  published: string;
  readTime: string;
  author: string;
  content: string;
  keywords?: string[];
};

type Props = {
  params: Promise<{ slug: string }>;
};

export default function BlogPostPage({ params }: Props) {
  const { t } = useI18n();
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const posts = blogData.posts as BlogPost[];
  const post = posts.find((p) => p.slug === slug);
  const showFloatingButton = useScrollThreshold(200);

  if (!post) {
    notFound();
  }

  const categories = {
    "personal-story": t.blog.categories.personalStory,
    "legal-guide": t.blog.categories.legalGuide,
    resource: t.blog.categories.resource,
  };

  const formattedDate = formatDate(post.published);

  // Simple markdown-like rendering (same as guides)
  const renderedContent = useMemo(() => {
    const lines = post.content.split("\n");
    const elements: React.ReactNode[] = [];
    let currentList: string[] = [];
    let listType: "ul" | "ol" | null = null;
    let currentTable: string[] = [];
    let inTable = false;

    // Helper to parse markdown table
    const parseTable = (tableLines: string[]) => {
      if (tableLines.length < 2) return null;
      const headerLine = tableLines[0];
      const separatorLine = tableLines[1];
      if (!separatorLine.match(/^[\s|:\-]+$/)) return null;

      const headers = headerLine
        .split("|")
        .map((h) => h.trim())
        .filter((h) => h);
      const rows: string[][] = [];

      for (let i = 2; i < tableLines.length; i++) {
        const row = tableLines[i]
          .split("|")
          .map((c) => c.trim())
          .filter((c) => c);
        if (row.length > 0) rows.push(row);
      }

      return { headers, rows };
    };

    // Helper to process bold text in cells
    const processCell = (cell: string) => {
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      const regex = /\*\*(.*?)\*\*/g;
      let match;

      while ((match = regex.exec(cell)) !== null) {
        if (match.index > lastIndex) {
          parts.push(cell.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index}>{match[1]}</strong>);
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < cell.length) {
        parts.push(cell.substring(lastIndex));
      }
      return parts.length > 0 ? parts : [cell];
    };

    lines.forEach((line, idx) => {
      // Check if line is a table row (starts with | and contains multiple |)
      const trimmedLine = line.trim();
      const isTableRow = trimmedLine.startsWith("|") && trimmedLine.split("|").length >= 3;
      const isTableSeparator = trimmedLine.match(/^[\s|:\-]+$/);

      if (isTableRow || isTableSeparator) {
        if (!inTable) {
          // Close any open list
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
          inTable = true;
        }
        currentTable.push(line);
        return;
      } else if (inTable && currentTable.length > 0) {
        // End of table, render it
        const tableData = parseTable(currentTable);
        if (tableData) {
          elements.push(
            <div
              key={`table-${idx}`}
              className="my-6 overflow-x-auto rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
            >
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-zinc-100 dark:bg-zinc-800">
                    {tableData.headers.map((header, i) => (
                      <th
                        key={i}
                        className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700"
                      >
                        {processCell(header)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.rows.map((row, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className="border-b border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      {tableData.headers.map((_, colIdx) => (
                        <td
                          key={colIdx}
                          className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400"
                        >
                          {row[colIdx] ? processCell(row[colIdx]) : ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        currentTable = [];
        inTable = false;
      }
      if (line.startsWith("## ")) {
        if (currentList.length > 0) {
          const ListTag = listType === "ol" ? "ol" : "ul";
          elements.push(
            <ListTag
              key={`list-${idx}`}
              className="list-disc list-inside mb-3 space-y-1 ml-4 text-zinc-500 dark:text-zinc-400"
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
              <ol
                key={`list-${idx}`}
                className="list-decimal list-inside mb-3 space-y-1 ml-4 text-zinc-500 dark:text-zinc-400"
              >
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
              <ul
                key={`list-${idx}`}
                className="list-disc list-inside mb-3 space-y-1 ml-4 text-zinc-500 dark:text-zinc-400"
              >
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
              className={`${listType === "ol" ? "list-decimal" : "list-disc"} list-inside mb-3 space-y-1 ml-4 text-zinc-500 dark:text-zinc-400`}
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
              className={`${listType === "ol" ? "list-decimal" : "list-disc"} list-inside mb-3 space-y-1 ml-4 text-zinc-500 dark:text-zinc-400`}
            >
              {currentList.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ListTag>
          );
          currentList = [];
          listType = null;
        }
        // Handle bold text with **text**
        const processedLine = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        elements.push(
          <p
            key={`p-${idx}`}
            className="mb-3 text-zinc-700 dark:text-zinc-300"
            dangerouslySetInnerHTML={{ __html: processedLine }}
          />
        );
      }
    });

    if (currentList.length > 0) {
      const ListTag = listType === "ol" ? "ol" : "ul";
      elements.push(
        <ListTag
          key="list-final"
          className={`${listType === "ol" ? "list-decimal" : "list-disc"} list-inside mb-3 space-y-1 ml-4 text-zinc-500 dark:text-zinc-400`}
        >
          {currentList.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ListTag>
      );
    }

    // Handle table at end of content
    if (inTable && currentTable.length > 0) {
      const tableData = parseTable(currentTable);
      if (tableData) {
        elements.push(
          <div
            key="table-final"
            className="my-6 overflow-x-auto rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
          >
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-800">
                  {tableData.headers.map((header, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700"
                    >
                      {processCell(header)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.rows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="border-b border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    {tableData.headers.map((_, colIdx) => (
                      <td
                        key={colIdx}
                        className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400"
                      >
                        {row[colIdx] ? processCell(row[colIdx]) : ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    }

    return elements;
  }, [post.content]);

  return (
    <>
      <article className="w-full max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div>
          <Link
            href="/blog"
            className="text-sm text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors mb-4 inline-block"
          >
            {t.blog.backToBlog}
          </Link>
          <h1 className="text-2xl font-semibold mb-2 text-zinc-900 dark:text-zinc-50">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-zinc-700 dark:text-zinc-300 mb-4">
            <span className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {categories[post.category as keyof typeof categories] || post.category}
            </span>
            <span className="text-zinc-700 dark:text-zinc-300">{post.readTime}</span>
            <span className="text-zinc-700 dark:text-zinc-300">{formattedDate}</span>
            {post.author && (
              <span className="text-zinc-700 dark:text-zinc-300">
                {t.blog.by} {post.author}
              </span>
            )}
          </div>
          <p className="text-zinc-700 dark:text-zinc-300 mb-6 italic">{post.excerpt}</p>
        </div>

        {t.blog.languageNote && (
          <div className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-blue-50 dark:bg-blue-900/20 p-4 text-sm text-zinc-800 dark:text-zinc-300">
            <p>{t.blog.languageNote}</p>
          </div>
        )}

        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {renderedContent}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 p-4 text-sm text-zinc-800 dark:text-zinc-300">
          <p>{t.blog.postDisclaimer}</p>
        </div>

        <div className="border-t border-zinc-300 dark:border-zinc-700 pt-6">
          <h3 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-50">
            {t.blog.aboutAuthor}
          </h3>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            {t.blog.authorDescription.replace("{author}", post.author || "")}
          </p>
        </div>
      </article>

      {showFloatingButton && (
        <Link
          href="/blog"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg shadow-lg hover:bg-zinc-700 dark:hover:bg-zinc-600 hover:text-zinc-100 transition-all duration-300 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium hover:shadow-xl"
          aria-label={t.blog.backToBlog}
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
          <span className="hidden sm:inline">{t.blog.backToBlog.replace("← ", "")}</span>
          <span className="sm:hidden">Back</span>
        </Link>
      )}
    </>
  );
}
