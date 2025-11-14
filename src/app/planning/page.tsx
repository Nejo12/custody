"use client";
import Link from "next/link";
import { useI18n } from "@/i18n";
import { useState, useEffect } from "react";
import planningDataEn from "@/data/planning.json";
import type { PlanningGuide, PlanningStage } from "@/types/planning";

// Lazy load locale-specific planning data (when available)
// Currently only English is available, other languages fall back to English
const loadPlanning = async (_locale: string) => {
  // TODO: Add other language files in Phase 4
  // For now, always return English
  return planningDataEn;
};

export default function PlanningPage() {
  const { t, locale } = useI18n();
  const [planningData, setPlanningData] = useState(planningDataEn);
  const [selectedStage, setSelectedStage] = useState<PlanningStage | "all">("all");

  useEffect(() => {
    loadPlanning(locale).then((data) => setPlanningData(data));
  }, [locale]);

  const guides = planningData.guides as PlanningGuide[];

  // Filter guides by selected stage
  const filteredGuides =
    selectedStage === "all" ? guides : guides.filter((guide) => guide.stage === selectedStage);

  // Stage info
  const stages: { id: PlanningStage; icon: string }[] = [
    { id: "expecting", icon: "🤰" },
    { id: "at-birth", icon: "👶" },
    { id: "first-year", icon: "🍼" },
    { id: "early-warning", icon: "⚠️" },
  ];

  // Urgency badge colors
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-300 dark:border-red-800";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-300 dark:border-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300 dark:border-blue-800";
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-8">
      {/* Hero Section */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          {t.planning?.title || "Planning & Prevention"}
        </h1>
        <p className="text-lg text-zinc-700 dark:text-zinc-300">
          {t.planning?.subtitle || "Protect Your Parental Rights Before Problems Arise"}
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {t.planning?.description ||
            "Essential legal steps for expectant parents and families. Establish custody rights, understand German family law, and prevent custody disputes before they happen."}
        </p>
      </div>

      {/* CTA Banner */}
      <div className="rounded-lg border-2 border-blue-300 dark:border-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
          {t.planning?.hero?.title || "Your Journey to Secure Parental Rights"}
        </h2>
        <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-4">
          {t.planning?.hero?.description ||
            "Whether you're expecting a baby, just had a child, or facing relationship challenges, taking the right legal steps NOW can prevent months of stress and legal battles later."}
        </p>
        <Link
          href="/planning/checklist"
          className="inline-block px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg shadow-lg bg-zinc-800 dark:bg-zinc-700 text-white hover:bg-zinc-700 dark:hover:bg-zinc-600 transition-all duration-300 text-xs sm:text-sm font-medium hover:shadow-xl"
        >
          {t.planning?.hero?.cta || "Get Your Personalized Checklist"}
        </Link>
      </div>

      {/* Stage Navigation */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
          {t.planning?.chooseStage || "Choose Your Stage"}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <button
            onClick={() => setSelectedStage("all")}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedStage === "all"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600"
            }`}
          >
            <div className="text-2xl mb-1">📋</div>
            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-200">
              {t.planning?.allGuides || "All Guides"}
            </div>
          </button>
          {stages.map((stage) => (
            <button
              key={stage.id}
              onClick={() => setSelectedStage(stage.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedStage === stage.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600"
              }`}
            >
              <div className="text-2xl mb-1">{stage.icon}</div>
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-200 uppercase">
                {(
                  t.planning?.stages?.[
                    stage.id === "at-birth"
                      ? "atBirth"
                      : stage.id === "first-year"
                        ? "firstYear"
                        : stage.id === "early-warning"
                          ? "earlyWarning"
                          : stage.id
                  ]?.shortTitle || stage.id
                ).replace(/-/g, " ")}
              </div>
            </button>
          ))}
        </div>

        {/* Stage Description */}
        {selectedStage !== "all" && (
          <div className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-4 mb-6">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
              {t.planning?.stages?.[
                selectedStage === "at-birth"
                  ? "atBirth"
                  : selectedStage === "first-year"
                    ? "firstYear"
                    : selectedStage === "early-warning"
                      ? "earlyWarning"
                      : selectedStage
              ]?.title || selectedStage}
            </h3>
            <p className="text-sm text-zinc-700 dark:text-zinc-400">
              {t.planning?.stages?.[
                selectedStage === "at-birth"
                  ? "atBirth"
                  : selectedStage === "first-year"
                    ? "firstYear"
                    : selectedStage === "early-warning"
                      ? "earlyWarning"
                      : selectedStage
              ]?.fullDescription || ""}
            </p>
          </div>
        )}
      </div>

      {/* Guides List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {selectedStage === "all"
              ? t.planning?.allGuides || "All Guides"
              : t.planning?.guidesForThisStage || "Guides for This Stage"}
          </h2>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {filteredGuides.length}{" "}
            {filteredGuides.length === 1
              ? t.planning?.guide || "guide"
              : t.planning?.guides || "guides"}
          </span>
        </div>

        <div className="space-y-4">
          {filteredGuides.map((guide) => (
            <Link key={guide.slug} href={`/planning/${guide.slug}`} className="group block">
              <article className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-5 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all hover:scale-[1.01] cursor-pointer">
                <div className="flex items-start gap-4">
                  {/* Stage Icon */}
                  <div className="text-3xl flex-shrink-0">
                    {stages.find((s) => s.id === guide.stage)?.icon || "📄"}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-zinc-700 dark:text-zinc-400 mb-3 line-clamp-2">
                      {guide.excerpt}
                    </p>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={`px-2 py-1 rounded border font-medium ${getUrgencyColor(guide.urgency)}`}
                      >
                        {t.planning?.urgency?.[guide.urgency as keyof typeof t.planning.urgency] ||
                          guide.urgency}
                      </span>
                      <span className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                        {t.planning?.categories?.[
                          guide.stage === "at-birth"
                            ? "atBirth"
                            : guide.stage === "first-year"
                              ? "firstYear"
                              : guide.stage === "early-warning"
                                ? "earlyWarning"
                                : guide.stage
                        ] || guide.stage}
                      </span>
                      <span className="text-zinc-600 dark:text-zinc-400">{guide.readTime}</span>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {filteredGuides.length === 0 && (
          <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
            <p>{t.planning?.noGuidesAvailable || "No guides available for this stage yet."}</p>
            <p className="text-sm mt-2">
              {t.planning?.checkBackSoon || "Check back soon as we add more content!"}
            </p>
          </div>
        )}
      </div>

      {/* Why This Matters Section */}
      <div className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-amber-50 dark:bg-amber-900/10 p-6">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
          {t.planning?.whyThisMatters?.title || "Why This Matters"}
        </h2>
        <p className="text-sm text-zinc-700 dark:text-zinc-400 mb-4">
          {t.planning?.whyThisMatters?.subtitle ||
            "Real stories from parents who wish they'd acted sooner"}
        </p>
        <div className="space-y-4">
          <blockquote className="border-l-4 border-amber-500 pl-4 italic text-sm text-zinc-700 dark:text-zinc-300">
            <p className="mb-2">
              &quot;
              {t.planning?.whyThisMatters?.story1?.quote ||
                "I spent 10 years in a relationship. When we separated, I discovered I had no legal custody rights. I couldn't see my daughters for months while going through court."}
              &quot;
            </p>
            <footer className="text-xs text-zinc-600 dark:text-zinc-400">
              — {t.planning?.whyThisMatters?.story1?.author || "Father, Berlin"}
            </footer>
          </blockquote>
          <blockquote className="border-l-4 border-amber-500 pl-4 italic text-sm text-zinc-700 dark:text-zinc-300">
            <p className="mb-2">
              &quot;
              {t.planning?.whyThisMatters?.story2?.quote ||
                "We thought 'we trust each other, we don't need paperwork.' Then the relationship ended, and suddenly trust wasn't enough. The legal battle took 9 months."}
              &quot;
            </p>
            <footer className="text-xs text-zinc-600 dark:text-zinc-400">
              — {t.planning?.whyThisMatters?.story2?.author || "Parent, Munich"}
            </footer>
          </blockquote>
        </div>
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-4 bg-white dark:bg-zinc-800 p-3 rounded">
          💡{" "}
          {t.planning?.whyThisMatters?.takeaway ||
            "Establishing custody rights takes one hour at the Jugendamt while your relationship is stable. Fighting for them in court takes months, costs thousands, and causes immense stress."}
        </p>
      </div>

      {/* Additional CTAs */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link
          href="/planning/interview"
          className="block p-5 rounded-lg border-2 border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all group"
        >
          <div className="text-2xl mb-2">🎯</div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {t.planning?.cta?.getPersonalizedPlan || "Get Personalized Plan"}
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {t.planning?.getPersonalizedPlanDescription ||
              "Answer a few questions to get your customized checklist"}
          </p>
        </Link>

        <Link
          href="/planning/checklist"
          className="block p-5 rounded-lg border-2 border-zinc-300 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
        >
          <div className="text-2xl mb-2">✅</div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {t.planning?.interactiveChecklist || "Interactive Checklist"}
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {t.planning?.interactiveChecklistDescription ||
              "Track your progress through essential legal steps"}
          </p>
        </Link>

        <Link
          href="/planning/resources"
          className="block p-5 rounded-lg border-2 border-zinc-300 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
        >
          <div className="text-2xl mb-2">📍</div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {t.planning?.cta?.findResources || "Find Local Resources"}
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {t.planning?.findResourcesDescription || "Jugendamt and Standesamt locations near you"}
          </p>
        </Link>
      </div>

      {/* Disclaimer */}
      {t.planning?.languageNote && (
        <div className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-blue-50 dark:bg-blue-900/20 p-4 text-sm text-zinc-700 dark:text-zinc-400">
          <p>{t.planning.languageNote}</p>
        </div>
      )}
      <div className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-4 text-sm text-zinc-700 dark:text-zinc-400">
        <p>
          {t.planning?.disclaimer ||
            "Note: This information provides general guidance only, not individualized legal advice. For advice specific to your situation, consult a qualified family law attorney."}
        </p>
      </div>
    </div>
  );
}
