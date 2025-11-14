"use client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/i18n";
import planningDataEn from "@/data/planning.json";
import { formatDate } from "@/lib/utils";
import { use, useMemo, useState, useEffect } from "react";
import { useScrollThreshold } from "@/lib/hooks";
import type { PlanningGuide } from "@/types/planning";

/**
 * Lazy load locale-specific planning data
 * Currently only English is available, other languages fall back to English
 * TODO: Add other language files in Phase 4
 */
const loadPlanning = async (_locale: string) => {
  return planningDataEn;
};

/**
 * Props for the PlanningGuidePage component
 */
type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * Individual planning guide detail page
 * Displays full content of a planning guide with proper formatting
 */
export default function PlanningGuidePage({ params }: Props) {
  // Resolve params promise (Next.js 15+ requirement)
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  // Get i18n translation function and current locale
  const { t, locale } = useI18n();

  // State for locale-specific planning data
  const [planningData, setPlanningData] = useState(planningDataEn);

  // Show floating back button after scrolling 200px
  const showFloatingButton = useScrollThreshold(200);

  // Load locale-specific data when locale changes
  useEffect(() => {
    loadPlanning(locale).then((data) => setPlanningData(data));
  }, [locale]);

  // Find the specific guide by slug
  const guides = planningData.guides as PlanningGuide[];
  const guide = guides.find((g) => g.slug === slug);

  // Show 404 if guide not found
  if (!guide) {
    notFound();
  }

  // Map stage IDs to translated category labels
  const stageLabels: Record<string, string> = {
    expecting: t.planning?.categories?.expecting || "Expecting",
    "at-birth": t.planning?.categories?.atBirth || "At Birth",
    "first-year": t.planning?.categories?.firstYear || "First Year",
    "early-warning": t.planning?.categories?.earlyWarning || "Relationship Trouble",
  };

  // Map urgency levels to translated labels
  const urgencyLabels: Record<string, string> = {
    critical: t.planning?.urgency?.critical || "Critical",
    high: t.planning?.urgency?.high || "High Priority",
    medium: t.planning?.urgency?.medium || "Medium Priority",
    low: t.planning?.urgency?.low || "Important",
  };

  // Get urgency badge colors based on urgency level
  const getUrgencyColor = (urgency: string): string => {
    switch (urgency) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-300 dark:border-red-800";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-300 dark:border-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-800";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-300 dark:border-blue-800";
    }
  };

  // Format published date
  const formattedDate = formatDate(guide.published);

  /**
   * Render markdown-like content with proper HTML structure
   * Supports: headings (##, ###), lists (-, 1.), paragraphs, tables, and line breaks
   */
  const renderedContent = useMemo(() => {
    const lines = guide.content.split("\n");
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
      // H2 heading (##)
      if (line.startsWith("## ")) {
        // Flush any pending list
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
          <h2
            key={`h2-${idx}`}
            className="text-xl font-semibold mt-6 mb-3 text-zinc-900 dark:text-zinc-300"
          >
            {line.replace("## ", "")}
          </h2>
        );
      }
      // H3 heading (###)
      else if (line.startsWith("### ")) {
        // Flush any pending list
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
          <h3
            key={`h3-${idx}`}
            className="text-lg font-semibold mt-4 mb-2 text-zinc-900 dark:text-zinc-300"
          >
            {line.replace("### ", "")}
          </h3>
        );
      }
      // Unordered list item (-)
      else if (line.startsWith("- ")) {
        if (listType !== "ul") {
          // Flush previous ordered list if exists
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
      }
      // Ordered list item (1., 2., etc.)
      else if (line.match(/^\d+\. /)) {
        if (listType !== "ol") {
          // Flush previous unordered list if exists
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
      }
      // Empty line
      else if (line.trim() === "") {
        // Flush any pending list
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
      }
      // Regular paragraph text
      else if (line.trim()) {
        // Flush any pending list
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

    // Flush any remaining list items
    if (currentList.length > 0) {
      const ListTag = listType === "ol" ? "ol" : "ul";
      elements.push(
        <ListTag
          key="list-final"
          className={`${listType === "ol" ? "list-decimal" : "list-disc"} list-inside mb-3 space-y-1 ml-4 text-zinc-700 dark:text-zinc-300`}
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
  }, [guide.content]);

  return (
    <>
      <article className="w-full max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Back link */}
        <div>
          <Link
            href="/planning"
            className="text-sm text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors mb-4 inline-block"
          >
            {t.planning?.backToPlanning || "← Back to Planning"}
          </Link>

          {/* Guide title and metadata */}
          <h1 className="text-2xl font-semibold mb-2 text-zinc-900 dark:text-zinc-50">
            {guide.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm mb-4">
            <span className={`px-2 py-1 rounded font-medium ${getUrgencyColor(guide.urgency)}`}>
              {urgencyLabels[guide.urgency] || guide.urgency}
            </span>
            <span className="px-2 py-1 rounded bg-zinc-800 dark:bg-zinc-600 text-zinc-100 dark:text-zinc-100">
              {stageLabels[guide.stage] || guide.stage}
            </span>
            <span className="text-zinc-700 dark:text-zinc-300">{guide.readTime}</span>
            <span className="text-zinc-700 dark:text-zinc-300">{formattedDate}</span>
          </div>
          <p className="text-zinc-700 dark:text-zinc-300 mb-6">{guide.excerpt}</p>
        </div>

        {/* Required documents section (if available) */}
        {guide.requiredDocuments && guide.requiredDocuments.length > 0 && (
          <div className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-blue-50 dark:bg-blue-900/20 p-4">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              📄 Required Documents
            </h3>
            <ul className="text-sm text-zinc-700 dark:text-zinc-300 space-y-1">
              {guide.requiredDocuments.map((doc, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400">•</span>
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Language note (if available) */}
        {t.planning?.languageNote && (
          <div className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-blue-50 dark:bg-blue-900/20 p-4 text-sm text-zinc-800 dark:text-zinc-300">
            <p>{t.planning.languageNote}</p>
          </div>
        )}

        {/* Main content */}
        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <div className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {renderedContent}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-lg border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 p-4 text-sm text-zinc-800 dark:text-zinc-100">
          <p>
            {t.planning?.guideDisclaimer ||
              "Disclaimer: This guide provides general information only, not individualized legal advice. German family law can be complex, and every situation is unique. For advice specific to your circumstances, consult a qualified family law attorney (Fachanwalt für Familienrecht)."}
          </p>
        </div>

        {/* Related actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Link
            href="/planning/checklist"
            className="block p-4 rounded-lg border-2 border-zinc-300 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
          >
            <div className="text-xl mb-1">✅</div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              Interactive Checklist
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Track your progress through essential steps
            </p>
          </Link>

          <Link
            href="/planning/resources"
            className="block p-4 rounded-lg border-2 border-zinc-300 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
          >
            <div className="text-xl mb-1">📍</div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              Find Local Resources
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Jugendamt and Standesamt near you
            </p>
          </Link>
        </div>
      </article>

      {/* Floating back button (shows after scrolling) */}
      {showFloatingButton && (
        <Link
          href="/planning"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg shadow-lg hover:bg-zinc-700 dark:hover:bg-zinc-600 hover:text-zinc-100 transition-all duration-300 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium hover:shadow-xl"
          aria-label={t.planning?.backToPlanning || "Back to Planning"}
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
            {(t.planning?.backToPlanning || "← Back to Planning").replace("← ", "")}
          </span>
          <span className="sm:hidden">Back</span>
        </Link>
      )}
    </>
  );
}
