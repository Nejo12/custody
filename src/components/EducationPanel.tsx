"use client";
import { useState } from "react";
import { useI18n } from "@/i18n";
import { motion, AnimatePresence } from "framer-motion";

export type EducationItem = {
  title: string;
  why: string;
  law: string;
  unsure: string;
  citations: { label?: string; url: string; snapshotId?: string }[];
};

export default function EducationPanel({ item }: { item: EducationItem }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(true);
  const headings = t.education?.headings || {
    why: "Why this question matters",
    law: "What the law says",
    unsure: "What you can do if you're not sure",
    sources: "Sources",
  };
  return (
    <div className="rounded-lg border p-4 bg-white dark:bg-zinc-900">
      <button
        type="button"
        className="w-full text-left font-medium flex items-center justify-between text-zinc-500 dark:text-zinc-400"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{item.title}</span>
        <span aria-hidden className={`transition-transform ${open ? "rotate-90" : ""}`}>
          ›
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-3 space-y-3 text-sm overflow-hidden"
          >
            <section>
              <div className="font-medium flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <circle cx="12" cy="16" r="1" />
                </svg>
                {headings.why}
              </div>
              <p className="text-zinc-700 dark:text-zinc-500">{item.why}</p>
            </section>
            <section>
              <div className="font-medium flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <path d="M12 1v22" />
                  <path d="M3 8h18" />
                  <path d="M5 8c0 4 3 7 7 7s7-3 7-7" />
                </svg>
                {headings.law}
              </div>
              <p className="text-zinc-700 dark:text-zinc-500">{item.law}</p>
            </section>
            <section>
              <div className="font-medium flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6 2h12l-1.5 4H7.5L6 2z" />
                  <path d="M6 2v15" />
                </svg>
                {headings.unsure}
              </div>
              <p className="text-zinc-700 dark:text-zinc-500">{item.unsure}</p>
            </section>
            {!!item.citations?.length && (
              <section>
                <div className="font-medium flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden
                  >
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6 2h9a2 2 0 0 1 2 2v15" />
                    <path d="M8 6h7" />
                  </svg>
                  {headings.sources}
                </div>
                <ul className="list-disc pl-5 text-zinc-700 dark:text-zinc-500">
                  {item.citations.map((c, i) => (
                    <li key={i}>
                      <a
                        className="underline"
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {c.label || c.url}
                      </a>
                      {c.snapshotId && (
                        <span className="ml-2 text-xs text-zinc-700 dark:text-zinc-400">
                          ({c.snapshotId})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
