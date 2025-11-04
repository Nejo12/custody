"use client";
import rules from "@/data/rules.json";
import eduEN from "@/data/education.en.json";
import eduDE from "@/data/education.de.json";
import eduFR from "@/data/education.fr.json";
import eduAR from "@/data/education.ar.json";
import eduPL from "@/data/education.pl.json";
import eduRU from "@/data/education.ru.json";
import eduTR from "@/data/education.tr.json";
import { evaluateRules } from "@/lib/rules";
import { useAppStore } from "@/store/app";
import { useI18n } from "@/i18n";
import Link from "next/link";
import type { SimpleRule, Citation } from "@/lib/rules";
import StatusCard from "@/components/StatusCard";
import type { TranslationDict } from "@/types";
import { motion } from "framer-motion";
import EducationPanel, { type EducationItem } from "@/components/EducationPanel";
import { useState } from "react";
import HelpSheet from "@/components/HelpSheet";
import JSZip from "jszip";
import type { ClarifyResponse } from "@/types/ai";
import regionalTips from "@/data/regional.tips.json";

type StatusKey = keyof TranslationDict["result"]["statuses"];

export default function Result() {
  const { interview } = useAppStore();
  const { t, locale } = useI18n();
  const { matched, primary, confidence } = evaluateRules(rules as SimpleRule[], interview.answers);

  const status = (primary?.outcome.status || "unknown") as StatusKey;
  const citations = (primary?.outcome.citations || []) as (Citation | string)[];
  type EducationMap = Record<string, EducationItem>;
  const edu = (
    locale === "de"
      ? eduDE
      : locale === "fr"
        ? eduFR
        : locale === "ar"
          ? eduAR
          : locale === "pl"
            ? eduPL
            : locale === "ru"
              ? eduRU
              : locale === "tr"
                ? eduTR
                : eduEN
  ) as EducationMap;

  const important = ["married_at_birth", "paternity_ack", "joint_declaration", "blocked_contact"];
  const missing = important
    .filter((k) => !interview.answers[k] || interview.answers[k] === "unsure")
    .slice(0, 2);
  const unclear = status === "unknown";
  const [helpOpen, setHelpOpen] = useState(false);
  const [assistant, setAssistant] = useState<{
    loading: boolean;
    data: Record<string, ClarifyResponse>;
  }>({ loading: false, data: {} });
  const { preferredCity } = useAppStore();
  const [city] = useState<"berlin" | "hamburg" | "nrw">(preferredCity || "berlin");

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 space-y-6">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-xl font-semibold"
      >
        {t.result.title}
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <StatusCard
          title={t.result.statuses[status] || status}
          message={
            primary?.outcome.message
              ? t.rules?.[primary.id as keyof typeof t.rules] || primary.outcome.message
              : undefined
          }
          confidence={confidence}
          tone={
            status === "joint_custody_default"
              ? "success"
              : status === "eligible_joint_custody"
                ? "info"
                : status === "apply_contact_order"
                  ? "warn"
                  : "info"
          }
        />
      </motion.div>

      {unclear && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="space-y-3"
        >
          <div className="text-sm text-zinc-600">
            {t.result.pathHint || "If unsure, you can file this now and add details later."}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              className="rounded-lg border p-3 hover:bg-zinc-50 dark:hover:bg-zinc-200 hover:text-black dark:hover:text-black"
              onClick={async () => {
                const targets = missing.slice(0, 2);
                if (!targets.length) return;
                setAssistant({ loading: true, data: {} });
                try {
                  const pairs = await Promise.all(
                    targets.map(async (q) => {
                      const qKey = q as keyof TranslationDict["interview"]["questions"];
                      const payload = {
                        questionId: q,
                        questionText: t.interview.questions[qKey]?.label || q,
                        answers: interview.answers,
                        locale,
                      };
                      const r = await fetch("/api/ai/clarify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                      });
                      const data = (await r.json()) as ClarifyResponse;
                      return [q, data] as const;
                    })
                  );
                  const map: Record<string, ClarifyResponse> = {};
                  for (const [q, d] of pairs) map[q] = d;
                  setAssistant({ loading: false, data: map });
                } catch {
                  setAssistant({ loading: false, data: {} });
                  alert("Assistant unavailable at the moment.");
                }
              }}
            >
              Ask the Assistant
            </button>
            <button
              className="rounded-lg border p-3 hover:bg-zinc-50 dark:hover:bg-zinc-200 hover:text-black dark:hover:text-black"
              onClick={() => {
                const q = missing[0] || "married_at_birth";
                window.location.href = `/interview?q=${q}`;
              }}
            >
              Jump To Key Question
            </button>
            <button
              className="rounded-lg border p-3 hover:bg-zinc-50 dark:hover:bg-zinc-200 hover:text-black dark:hover:text-black"
              onClick={() => setHelpOpen(true)}
            >
              Find Help Now
            </button>
          </div>

          {/* Top-2 answer chips */}
          {!!missing.length && (
            <div className="flex flex-wrap gap-2">
              {missing.slice(0, 2).map((q) => {
                const qKey = q as keyof TranslationDict["interview"]["questions"];
                return (
                  <button
                    key={q}
                    className="text-xs rounded-full border px-3 py-1 underline"
                    onClick={() => (window.location.href = `/interview?q=${q}`)}
                  >
                    Answer now: {t.interview.questions[qKey]?.label || q}
                  </button>
                );
              })}
            </div>
          )}

          {/* Assistant suggestions with one-tap accept */}
          {assistant.loading && <div className="text-xs text-zinc-500">Assistant thinking…</div>}
          {Object.keys(assistant.data).length > 0 && (
            <div className="space-y-2">
              {missing.slice(0, 2).map((q) => {
                const suggestion = assistant.data[q];
                if (!suggestion) return null;
                const label =
                  t.interview.questions[q as keyof TranslationDict["interview"]["questions"]]
                    ?.label;
                return (
                  <div key={q} className="rounded border p-2 bg-zinc-50 dark:bg-zinc-900">
                    <div className="text-sm">
                      {label || q}: <b>{suggestion.suggestion}</b>{" "}
                      <span className="text-xs text-zinc-500">
                        ({Math.round((suggestion.confidence || 0) * 100)}%)
                      </span>
                    </div>
                    {suggestion.followup && (
                      <div className="text-xs text-zinc-600 mt-1">{suggestion.followup}</div>
                    )}
                    <div className="mt-2 flex gap-2">
                      <button
                        className="text-xs rounded border px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        onClick={() => {
                          useAppStore.getState().setAnswer(q, suggestion.suggestion);
                        }}
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {(missing.length ? missing : ["generic"]).map((id) => {
            const item: EducationItem = (edu[id] || edu.generic) as EducationItem;
            return <EducationPanel key={id} item={item} />;
          })}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="space-y-2"
      >
        <h2 className="font-medium">{t.result.nextSteps}</h2>
        <div className="grid grid-cols-1 gap-2">
          {(status === "eligible_joint_custody" || status === "joint_custody_default") && (
            <Link href="/pdf/gemeinsame-sorge" className="underline">
              {t.result.generateJointCustody}
            </Link>
          )}
          {status === "apply_contact_order" && (
            <Link href="/pdf/umgangsregelung" className="underline">
              {t.result.generateContactOrder}
            </Link>
          )}
          {/* Pack actions */}
          {(status === "eligible_joint_custody" || status === "joint_custody_default") && (
            <div className="flex gap-3 text-sm">
              <button className="underline" onClick={() => buildAndDownloadPack("joint")}>
                Download Pack
              </button>
              <button className="underline" onClick={() => sharePack("joint")}>
                Email Me Pack
              </button>
            </div>
          )}
          {status === "apply_contact_order" && (
            <div className="flex gap-3 text-sm">
              <button className="underline" onClick={() => buildAndDownloadPack("contact")}>
                Download Pack
              </button>
              <button className="underline" onClick={() => sharePack("contact")}>
                Email Me Pack
              </button>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="space-y-2"
      >
        <h2 className="font-medium">{t.result.sources}</h2>
        <ul className="list-disc pl-5 text-sm">
          {citations.map((c, i) => {
            const citation: Citation = typeof c === "string" ? { url: c } : c;
            return (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.4 + i * 0.05 }}
              >
                <a
                  href={citation.url || ""}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {citation.label || citation.url || ""}
                </a>
                {citation.snapshotId ? (
                  <span className="ml-2 text-xs text-zinc-500">({citation.snapshotId})</span>
                ) : null}
              </motion.li>
            );
          })}
        </ul>
      </motion.div>

      {matched.length > 1 && (
        <motion.details
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="text-xs text-zinc-500"
        >
          <summary>Additional matched rules</summary>
          <ul className="list-disc pl-5">
            {matched.slice(1).map((m) => (
              <li key={m.id}>
                {m.id}: {m.outcome.status}
              </li>
            ))}
          </ul>
        </motion.details>
      )}

      {/* Global Help Sheet reuse */}
      <HelpSheet open={helpOpen} onClose={() => setHelpOpen(false)} />

      {/* Confidence tips */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.35 }}
        className="rounded-lg border p-3 bg-white dark:bg-zinc-900"
      >
        <div className="text-sm font-medium mb-1">How to reach 95% confidence</div>
        <div className="text-sm text-zinc-700 dark:text-zinc-300">
          {missing.length > 0 ? "Answer these:" : "Add supporting documents in your vault."}
        </div>
        {!!missing.length && (
          <div className="mt-2 flex flex-wrap gap-2">
            {missing.slice(0, 2).map((q) => {
              const qKey = q as keyof TranslationDict["interview"]["questions"];
              return (
                <button
                  key={q}
                  className="text-xs rounded-full border px-3 py-1 underline"
                  onClick={() => (window.location.href = `/interview?q=${q}`)}
                >
                  {t.interview.questions[qKey]?.label || q}
                </button>
              );
            })}
          </div>
        )}
        <div className="text-xs mt-2">
          Tip: add paternity acknowledgement or birth certificate scans in your{" "}
          <a className="underline" href="/vault">
            Vault
          </a>
          .
        </div>
      </motion.div>

      {/* Regional tips */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="rounded-lg border p-3"
      >
        <div className="text-sm font-medium">Regional Tips</div>
        <div className="text-sm text-zinc-700 dark:text-zinc-300 mt-1">
          {
            ((regionalTips as Record<string, string>)[city] ||
              "Local registries may have specific forms or appointment windows. Bring IDs and child’s birth details.") as string
          }
        </div>
      </motion.div>
    </div>
  );
}

async function generatePdf(type: "joint" | "contact", locale: string) {
  const url = type === "joint" ? "/api/pdf/gemeinsame-sorge" : "/api/pdf/umgangsregelung";
  const body =
    type === "joint"
      ? { formData: { courtTemplate: "" }, citations: [], snapshotIds: [], locale }
      : {
          formData: {
            courtTemplate: "",
            proposal: { weekday: {}, weekend: {}, holidays: {}, handover: {} },
          },
          citations: [],
          snapshotIds: [],
          locale,
        };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return await res.blob();
}

async function buildPackBlob(kind: "joint" | "contact", locale: string): Promise<Blob> {
  const zip = new JSZip();
  const date = new Date().toISOString().slice(0, 10);
  const cover =
    kind === "joint"
      ? `Cover letter\n\nTo the Family Court\nRequest: Joint custody application.\nDate: ${date}\n\nEnclosed: application PDF, birth certificate, paternity acknowledgement (if available).\nInformation only — not legal advice.`
      : `Cover letter\n\nTo the Family Court\nRequest: Contact/visitation order.\nDate: ${date}\n\nEnclosed: application PDF, communications/logs, proof of payments (if relevant).\nInformation only — not legal advice.`;
  const checklist =
    kind === "joint"
      ? `Bring This Checklist\n- IDs (both parents if possible)\n- Child's birth certificate\n- Paternity acknowledgement (if applicable)\n- Any court letters`
      : `Bring This Checklist\n- IDs\n- Proposed schedule (draft)\n- Communication log excerpts\n- Any safety notes (if applicable)`;
  zip.file("cover-letter.txt", cover);
  zip.file("checklist.txt", checklist);
  const pdfBlob = await generatePdf(kind, locale);
  const pdfArray = await pdfBlob.arrayBuffer();
  zip.file(kind === "joint" ? "gemeinsame-sorge.pdf" : "umgangsregelung.pdf", pdfArray);
  const blob = await zip.generateAsync({ type: "blob" });
  return blob;
}

async function buildAndDownloadPack(kind: "joint" | "contact") {
  const { locale } = useAppStore.getState();
  const blob = await buildPackBlob(kind, locale);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `custody-pack-${kind}-${new Date().toISOString().slice(0, 10)}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

async function sharePack(kind: "joint" | "contact") {
  try {
    const { locale } = useAppStore.getState();
    const blob = await buildPackBlob(kind, locale);
    const file = new File([blob], `custody-pack-${kind}.zip`, { type: "application/zip" });
    // Prefer Web Share API if available
    const nav = navigator as Navigator & {
      canShare?: (data?: ShareData & { files?: File[] }) => boolean;
      share?: (data: ShareData & { files?: File[] }) => Promise<void>;
    };
    if (typeof navigator !== "undefined" && nav.canShare && nav.canShare({ files: [file] })) {
      await nav.share?.({ files: [file], title: "Custody Clarity Pack" });
    } else {
      // Fallback: download and open mailto
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `custody-pack-${kind}-${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      window.location.href = `mailto:?subject=Your%20Custody%20Clarity%20Pack&body=Your%20pack%20was%20downloaded.%20Attach%20the%20ZIP%20to%20this%20email%20if%20you%20wish%20to%20send%20it.`;
    }
  } catch {
    alert("Unable to share pack. It has been downloaded instead.");
    await buildAndDownloadPack(kind);
  }
}
