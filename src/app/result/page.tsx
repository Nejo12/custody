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
import { useState, useEffect, useMemo } from "react";
import HelpSheet from "@/components/HelpSheet";
import JSZip from "jszip";
import { buildCoverLetter } from "@/lib/coverLetter";
import regionalTips from "@/data/regional.tips.json";
import { resolveCourtTemplate } from "@/lib/courts";
import Callout from "@/components/Callout";
import { buildICS } from "@/lib/ics";

type StatusKey = keyof TranslationDict["result"]["statuses"];

export default function Result() {
  const { interview } = useAppStore();
  const { t, locale } = useI18n();
  const { matched, primary } = evaluateRules(rules as SimpleRule[], interview.answers);

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
  const allMissing = important.filter(
    (k) => !interview.answers[k] || interview.answers[k] === "unsure"
  );
  const missing = allMissing.slice(0, 2);
  const unclear = status === "unknown";
  const [helpOpen, setHelpOpen] = useState(false);
  // Assistant suggestions removed from this view per UX tone simplification.
  const {
    preferredCity,
    preferredCourtTemplate,
    setPreferredCourtTemplate,
    includeTimelineInPack,
    setIncludeTimelineInPack,
    vault,
    preferredOcrNoteId,
    setPreferredOcrNoteId,
  } = useAppStore();
  const [city] = useState<"berlin" | "hamburg" | "nrw">(preferredCity || "berlin");
  const violenceFlag = interview.answers["history_of_violence"] === "yes";

  // Update milestones when conditions change (moved from render to prevent infinite loop)
  useEffect(() => {
    const { setMilestone } = useAppStore.getState();
    if (preferredCourtTemplate) setMilestone("courtSelected", true);
    if (preferredOcrNoteId) setMilestone("senderSelected", true);
    if (missing.length === 0) setMilestone("answeredCore", true);
  }, [preferredCourtTemplate, preferredOcrNoteId, missing.length]);

  // Extract OCR notes computation
  const ocrNotes = useMemo(
    () =>
      vault.entries.filter((e) => e.type === "note" && (e.payload as { fields?: unknown }).fields),
    [vault.entries]
  );

  // Extract selected OCR note and fields
  const selectedOcrNote = useMemo(
    () => (preferredOcrNoteId ? ocrNotes.find((n) => n.id === preferredOcrNoteId) : undefined),
    [preferredOcrNoteId, ocrNotes]
  );

  const selectedOcrFields = useMemo(() => {
    if (!selectedOcrNote) return {};
    return (
      (
        selectedOcrNote.payload as {
          fields?: {
            fullName?: string;
            address?: string;
            city?: string;
            phone?: string;
            email?: string;
          };
        }
      ).fields || {}
    );
  }, [selectedOcrNote]);

  // Extract city from address
  const extractCity = (addr?: string, city?: string): string => {
    if (city) return city;
    if (!addr) return "";
    const m = addr.match(/\b\d{5}\s+([A-Za-zÄÖÜäöüß\- ]{2,})\b/);
    return m ? m[1].trim() : "";
  };

  const extractedCity = useMemo(
    () => extractCity(selectedOcrFields.address, selectedOcrFields.city),
    [selectedOcrFields.address, selectedOcrFields.city]
  );

  // Timeline entry for pack
  const timelineEntry = useMemo(
    () =>
      vault.entries.find(
        (e) =>
          e.type === "note" &&
          typeof e.payload?.content === "string" &&
          e.title.toLowerCase().includes("timeline")
      ),
    [vault.entries]
  );

  // Court template info
  const courtInfo = useMemo(() => {
    if (!preferredCourtTemplate) return null;
    const c = resolveCourtTemplate(preferredCourtTemplate);
    if (!c.name && !c.address) return null;
    return c;
  }, [preferredCourtTemplate]);

  // Regional tips
  const regionalTip = useMemo(() => {
    const tip = (regionalTips as unknown as Record<string, unknown>)[city];
    if (!tip) return { text: t.result.regionalTipsDefault };
    if (typeof tip === "string") return { text: tip };
    const obj = tip as { text?: string; lastVerified?: string; snapshotId?: string };
    return {
      text: obj.text || t.result.regionalTipsDefault,
      lastVerified: obj.lastVerified,
      snapshotId: obj.snapshotId,
    };
  }, [city, t.result.regionalTipsDefault]);

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
      {/* Progress + next steps */}
      <div className="rounded-lg border p-3 bg-white dark:bg-zinc-900">
        <div className="flex items-center justify-between text-sm">
          <div className="text-sm">
            <span className="font-medium">
              {allMissing.length > 0
                ? `We need ${allMissing.length} quick details to confirm`
                : "All key details confirmed"}
            </span>
          </div>
          <button
            className="text-xs underline"
            onClick={() => {
              const ics = buildICS({
                summary: "Court filing (draft)",
                startISO: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                durationMinutes: 30,
              });
              const blob = new Blob([ics], { type: "text/calendar" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "filing-reminder.ics";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Add filing reminder
          </button>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs">
          {useMemo(() => {
            const steps = [
              { label: "Answer key questions", done: missing.length === 0 },
              { label: "Pick court", done: !!preferredCourtTemplate },
              { label: "Set sender", done: !!preferredOcrNoteId },
              { label: "Generate PDF", done: false },
            ];
            return (
              <div className="flex flex-wrap gap-2">
                {steps.map((s, i) => (
                  <span
                    key={s.label}
                    className={`px-2 py-1 rounded-full border ${s.done ? "bg-green-100 border-green-300 text-green-800" : "bg-white dark:bg-zinc-900"}`}
                  >
                    {s.done ? "✓" : i + 1}. {s.label}
                  </span>
                ))}
              </div>
            );
          }, [missing.length, preferredCourtTemplate, preferredOcrNoteId])}
        </div>
      </div>
      {/* Radical Clarity: Why this result? */}
      {matched.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-lg border p-3 bg-white dark:bg-zinc-900"
        >
          <div className="text-sm font-medium mb-1">
            {t.result.whyThisResult || "Why this result?"}
          </div>
          <div className="flex flex-wrap gap-2">
            {matched.slice(0, 3).map((r) => {
              const citationsArr = (r.outcome.citations || []) as (Citation | string)[];
              const firstCitation = citationsArr.find((c) => typeof c === "object") as
                | Citation
                | undefined;
              const label = t.rules?.[r.id as keyof typeof t.rules] || r.id;
              return (
                <details key={r.id} className="inline-block">
                  <summary className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800">
                    <span>{label}</span>
                    <span className="text-[10px] text-zinc-500">
                      {t.result.moreDetails || "More details"}
                    </span>
                    {firstCitation?.snapshotId && (
                      <span className="text-[10px] text-zinc-500">
                        ({firstCitation.snapshotId})
                      </span>
                    )}
                  </summary>
                  <div className="mt-1 rounded border px-3 py-2 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-800 dark:text-zinc-200">
                    <div className="mb-1">
                      {(t as TranslationDict).ruleExplain?.[
                        r.id as keyof TranslationDict["ruleExplain"]
                      ] ||
                        r.outcome.message ||
                        label}
                    </div>
                    {citationsArr.length > 0 && (
                      <ul className="list-disc pl-4 space-y-0.5">
                        {citationsArr.map((c, i) => {
                          const ci: Citation = typeof c === "string" ? { url: c } : c;
                          return (
                            <li key={i}>
                              {ci.url ? (
                                <a
                                  className="underline"
                                  href={ci.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {ci.label || ci.url}
                                </a>
                              ) : (
                                <span>{ci.label || "Citation"}</span>
                              )}
                              {ci.snapshotId ? (
                                <span className="ml-1 text-[10px] text-zinc-500">
                                  ({ci.snapshotId})
                                </span>
                              ) : null}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </details>
              );
            })}
          </div>
        </motion.div>
      )}
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
          <div className="text-sm text-zinc-700 dark:text-zinc-300">
            {t.result.pathHint || "If unsure, you can file this now and add details later."}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              className="rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 p-3 hover:bg-black dark:hover:bg-white"
              onClick={() => {
                const q = (allMissing[0] || "married_at_birth") as string;
                window.location.href = `/interview?q=${q}`;
              }}
            >
              {t.common?.next || "Continue"}
            </button>
            <button
              className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              onClick={() => setHelpOpen(true)}
            >
              {t.result?.findHelpNow || "Find help near me"}
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
                    {t.result.answerNow} {t.interview.questions[qKey]?.label || q}
                  </button>
                );
              })}
            </div>
          )}

          {/* Assistant removed in Result view */}

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
        {violenceFlag && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <Callout tone="error" title={t.result.safetyTitle}>
              {t.result.safetyBody}
            </Callout>
          </motion.div>
        )}
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
          {/* Compact Pack section */}
          <div className="mt-2 rounded-lg border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">{t.result.packSection || "Pack"}</div>
              <div className="flex gap-3 text-sm">
                {(status === "eligible_joint_custody" || status === "joint_custody_default") && (
                  <button className="underline" onClick={() => buildAndDownloadPack("joint", t)}>
                    {t.result.downloadPack}
                  </button>
                )}
                {status === "apply_contact_order" && (
                  <button className="underline" onClick={() => buildAndDownloadPack("contact", t)}>
                    {t.result.downloadPack}
                  </button>
                )}
                {(status === "eligible_joint_custody" || status === "joint_custody_default") && (
                  <button className="underline" onClick={() => sharePack("joint", t)}>
                    {t.result.emailMePack}
                  </button>
                )}
                {status === "apply_contact_order" && (
                  <button className="underline" onClick={() => sharePack("contact", t)}>
                    {t.result.emailMePack}
                  </button>
                )}
              </div>
            </div>
            {/* Extra Action Packs */}
            <div className="flex flex-wrap gap-3 text-sm">
              <button className="underline" onClick={() => buildAndDownloadPack("mediation", t)}>
                {t.result.downloadMediationPack || "Download Mediation Pack"}
              </button>
              <button className="underline" onClick={() => sharePack("mediation", t)}>
                {t.result.emailMePack}
              </button>
              <button className="underline" onClick={() => buildAndDownloadPack("blocked", t)}>
                {t.result.downloadBlockedPack || "Download If Contact Is Blocked Pack"}
              </button>
              <button className="underline" onClick={() => sharePack("blocked", t)}>
                {t.result.emailMePack}
              </button>
            </div>
            <label className="block text-sm">
              {t.result.courtTemplate}
              <select
                className="mt-1 w-full rounded border px-3 py-2"
                value={preferredCourtTemplate || ""}
                onChange={(e) => setPreferredCourtTemplate(e.target.value)}
              >
                <option value="">{t.result.courtTemplateNone}</option>
                <optgroup label="Berlin">
                  <option value="berlin-mitte">Berlin – Amtsgericht Mitte</option>
                  <option value="berlin-pankow">Berlin – Amtsgericht Pankow/Weißensee</option>
                </optgroup>
                <optgroup label="Hamburg">
                  <option value="hamburg">Hamburg – Amtsgericht Hamburg</option>
                </optgroup>
                <optgroup label="Bayern">
                  <option value="bayern-muenchen">München – Amtsgericht München</option>
                </optgroup>
                <optgroup label="Baden‑Württemberg">
                  <option value="bw-stuttgart">Stuttgart – Amtsgericht Stuttgart</option>
                </optgroup>
                <optgroup label="Hessen">
                  <option value="hessen-frankfurt">
                    Frankfurt – Amtsgericht Frankfurt am Main
                  </option>
                </optgroup>
                <optgroup label="Sachsen">
                  <option value="sachsen-leipzig">Leipzig – Amtsgericht Leipzig</option>
                </optgroup>
                <optgroup label="Niedersachsen">
                  <option value="nds-hannover">Hannover – Amtsgericht Hannover</option>
                </optgroup>
                <optgroup label="Rheinland‑Pfalz">
                  <option value="rlp-mainz">Mainz – Amtsgericht Mainz</option>
                </optgroup>
                <optgroup label="Schleswig‑Holstein">
                  <option value="sh-kiel">Kiel – Amtsgericht Kiel</option>
                </optgroup>
                <optgroup label="Bremen">
                  <option value="bremen">Bremen – Amtsgericht Bremen</option>
                </optgroup>
                <optgroup label="Saarland">
                  <option value="saar-saarbruecken">Saarbrücken – Amtsgericht Saarbrücken</option>
                </optgroup>
                <optgroup label="Brandenburg">
                  <option value="bb-potsdam">Potsdam – Amtsgericht Potsdam</option>
                </optgroup>
                <optgroup label="Mecklenburg‑Vorpommern">
                  <option value="mv-rostock">Rostock – Amtsgericht Rostock</option>
                </optgroup>
                <optgroup label="Thüringen">
                  <option value="thueringen-erfurt">Erfurt – Amtsgericht Erfurt</option>
                </optgroup>
                <optgroup label="Sachsen‑Anhalt">
                  <option value="st-magdeburg">Magdeburg – Amtsgericht Magdeburg</option>
                </optgroup>
                <optgroup label="NRW">
                  <option value="koeln">Köln – Amtsgericht Köln</option>
                  <option value="duesseldorf">Düsseldorf – Amtsgericht Düsseldorf</option>
                  <option value="essen">Essen – Amtsgericht Essen</option>
                  <option value="dortmund">Dortmund – Amtsgericht Dortmund</option>
                  <option value="bonn">Bonn – Amtsgericht Bonn</option>
                  <option value="wuppertal">Wuppertal – Amtsgericht Wuppertal</option>
                  <option value="bochum">Bochum – Amtsgericht Bochum</option>
                </optgroup>
              </select>
            </label>
            <div className="text-xs text-zinc-700 dark:text-zinc-400 mt-1">
              {t.result.tailorCoverLetter}
            </div>
            <label className="mt-2 flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={includeTimelineInPack}
                onChange={(e) => setIncludeTimelineInPack(e.target.checked)}
              />
              {t.result.attachTimeline}
            </label>
            {ocrNotes.length > 0 && (
              <label className="block text-sm mt-2">
                Sender (OCR note)
                <select
                  className="mt-1 w-full rounded border px-3 py-2"
                  value={preferredOcrNoteId || ""}
                  onChange={(e) => setPreferredOcrNoteId(e.target.value)}
                >
                  <option value="">—</option>
                  {ocrNotes.map((n) => (
                    <option
                      key={n.id}
                      value={n.id}
                    >{`${n.title} – ${new Date(n.timestamp).toISOString().slice(0, 10)}`}</option>
                  ))}
                </select>
                {selectedOcrNote && (selectedOcrFields.fullName || extractedCity) && (
                  <div className="text-xs text-zinc-700 dark:text-zinc-300 mt-1">
                    {selectedOcrFields.fullName || ""}
                    {selectedOcrFields.fullName && extractedCity ? " — " : ""}
                    {extractedCity}
                    {(selectedOcrFields.phone || selectedOcrFields.email) && (
                      <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
                        {selectedOcrFields.phone || ""}
                        {selectedOcrFields.phone && selectedOcrFields.email ? " · " : ""}
                        {selectedOcrFields.email || ""}{" "}
                        <a className="underline" href="/vault">
                          edit in Vault
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </label>
            )}
            {includeTimelineInPack && timelineEntry && (
              <div className="text-xs text-zinc-700 dark:text-zinc-300">
                {t.result.attachTimeline}
                {": "}
                <span className="italic">
                  {(timelineEntry.payload as { content?: string }).content?.slice(0, 60) || ""}
                  {"…"}
                </span>{" "}
                <a className="underline" href="/vault">
                  {t.vault.title}
                </a>
              </div>
            )}
            {/* Snapshot of selected court */}
            {courtInfo && (
              <div className="rounded border p-2 bg-zinc-50 dark:bg-zinc-800/20">
                {courtInfo.name && (
                  <div className="text-sm text-zinc-200 dark:text-zinc-500">{courtInfo.name}</div>
                )}
                {courtInfo.address && (
                  <div className="text-xs text-zinc-200 dark:text-zinc-500">
                    {courtInfo.address}
                  </div>
                )}
              </div>
            )}
          </div>
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
                  <span className="ml-2 text-xs text-zinc-700 dark:text-zinc-400">
                    ({citation.snapshotId})
                  </span>
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
          className="text-xs text-zinc-700 dark:text-zinc-400"
        >
          <summary>{t.result.additionalMatchedRules}</summary>
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
        <div className="text-sm font-medium mb-1 text-zinc-900 dark:text-zinc-100">
          {t.result.howToReach95Confidence}
        </div>
        <div className="text-sm text-zinc-800 dark:text-zinc-300">
          {missing.length > 0 ? t.result.answerThese : t.result.addSupportingDocuments}
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
        <div className="text-xs mt-2 text-zinc-700 dark:text-zinc-300">
          {t.result.confidenceTip}{" "}
          <a className="underline" href="/vault">
            {t.vault.title}
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
        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-400">
          {t.result.regionalTips}
        </div>
        <div className="text-sm text-zinc-800 dark:text-zinc-400 mt-1">
          <div>{regionalTip.text}</div>
          {(regionalTip.lastVerified || regionalTip.snapshotId) && (
            <div className="text-xs text-zinc-700 dark:text-zinc-600 mt-1">
              {regionalTip.lastVerified ? `Last verified: ${regionalTip.lastVerified}` : null}
              {regionalTip.snapshotId ? ` · Snapshot: ${regionalTip.snapshotId}` : null}
            </div>
          )}
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

async function buildPackBlob(
  kind: "joint" | "contact" | "mediation" | "blocked",
  locale: string,
  _t: TranslationDict
): Promise<Blob> {
  const zip = new JSZip();
  const date = new Date().toISOString().slice(0, 10);
  // Cover letters and checklists are kept in English/German as they're formal court documents
  const getCoverLetter = (
    kind: "joint" | "contact" | "mediation" | "blocked",
    date: string
  ): string => {
    if (kind === "joint")
      return `Cover letter\n\nTo the Family Court\nRequest: Joint custody application.\nDate: ${date}\n\nEnclosed: application PDF, birth certificate, paternity acknowledgement (if available).\nInformation only — not legal advice.`;
    if (kind === "contact")
      return `Cover letter\n\nTo the Family Court\nRequest: Contact/visitation order.\nDate: ${date}\n\nEnclosed: application PDF, communications/logs, proof of payments (if relevant).\nInformation only — not legal advice.`;
    if (kind === "mediation")
      return `Cover letter\n\nTo the Mediation Service/Jugendamt\nRequest: Mediation appointment to discuss a safe practical plan and handover rules.\nDate: ${date}\n\nEnclosed: brief summary, draft schedule.`;
    return `Cover letter\n\nTo the Family Court / Jugendamt\nSubject: Contact is being blocked — request for support/next steps.\nDate: ${date}\n\nEnclosed: timeline/log excerpts, relevant communications.`;
  };

  const getChecklist = (kind: "joint" | "contact" | "mediation" | "blocked"): string => {
    if (kind === "joint")
      return `Bring This Checklist\n- IDs (both parents if possible)\n- Child's birth certificate\n- Paternity acknowledgement (if applicable)\n- Any court letters`;
    if (kind === "contact")
      return `Bring This Checklist\n- IDs\n- Proposed schedule (draft)\n- Communication log excerpts\n- Any safety notes (if applicable)`;
    if (kind === "mediation")
      return `Bring This Checklist\n- IDs\n- Summary of issues\n- Draft schedule ideas\n- Any previous agreements`;
    return `Bring This Checklist\n- IDs\n- Timeline/log excerpts\n- Messages (screenshots)\n- Any safety notes`;
  };

  const cover = getCoverLetter(kind, date);
  const checklist = getChecklist(kind);
  // Add text cover letter and PDF cover letter
  zip.file("cover-letter.txt", cover);
  try {
    const state = useAppStore.getState();
    const getSenderFields = (state: ReturnType<typeof useAppStore.getState>) => {
      const notes = state.vault.entries.filter((e) => e.type === "note");
      const pick = state.preferredOcrNoteId
        ? notes.find((n) => n.id === state.preferredOcrNoteId)
        : notes.find((n) => (n.payload as { fields?: unknown }).fields);
      if (!pick) return undefined;
      return (
        pick.payload as {
          fields?: {
            fullName?: string;
            address?: string;
            phone?: string;
            email?: string;
            city?: string;
          };
        }
      ).fields;
    };
    const senderFields = getSenderFields(state);
    const pdfCover = await buildCoverLetter(
      kind,
      locale,
      state.preferredCourtTemplate,
      senderFields
    );
    zip.file("cover-letter.pdf", pdfCover);
  } catch {
    /* ignore pdf cover errors */
  }
  zip.file("checklist.txt", checklist);
  // Optional recent timeline from Vault (if present)
  try {
    if (useAppStore.getState().includeTimelineInPack) {
      const entries = useAppStore.getState().vault.entries;
      const timeline = entries.find(
        (e) =>
          e.type === "note" &&
          typeof e.payload?.content === "string" &&
          e.title.toLowerCase().includes("timeline")
      );
      if (timeline && typeof timeline.payload.content === "string") {
        zip.file("timeline.txt", timeline.payload.content);
      }
    }
  } catch {
    // ignore
  }
  if (kind === "joint" || kind === "contact") {
    const pdfBlob = await generatePdf(kind, locale);
    const pdfArray = await pdfBlob.arrayBuffer();
    zip.file(kind === "joint" ? "gemeinsame-sorge.pdf" : "umgangsregelung.pdf", pdfArray);
  }
  const blob = await zip.generateAsync({ type: "blob" });
  return blob;
}

async function buildAndDownloadPack(
  kind: "joint" | "contact" | "mediation" | "blocked",
  t: TranslationDict
) {
  const { locale } = useAppStore.getState();
  const blob = await buildPackBlob(kind, locale, t);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `custody-pack-${kind}-${new Date().toISOString().slice(0, 10)}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

async function sharePack(kind: "joint" | "contact" | "mediation" | "blocked", t: TranslationDict) {
  try {
    const { locale } = useAppStore.getState();
    const blob = await buildPackBlob(kind, locale, t);
    const file = new File([blob], `custody-pack-${kind}.zip`, { type: "application/zip" });
    // Prefer Web Share API if available
    const nav = navigator as Navigator & {
      canShare?: (data?: ShareData & { files?: File[] }) => boolean;
      share?: (data: ShareData & { files?: File[] }) => Promise<void>;
    };
    if (typeof navigator !== "undefined" && nav.canShare && nav.canShare({ files: [file] })) {
      await nav.share?.({ files: [file], title: t.appName + " Pack" });
    } else {
      // Fallback: download and open mailto
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `custody-pack-${kind}-${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      const subject = encodeURIComponent(t.appName + " Pack");
      const body = encodeURIComponent(
        t.result.packDownloaded ||
          "Your pack was downloaded. Attach the ZIP to this email if you wish to send it."
      );
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }
  } catch {
    alert(t.result.packShareError || "Unable to share pack. It has been downloaded instead.");
    await buildAndDownloadPack(kind, t);
  }
}
