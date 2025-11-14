"use client";

/**
 * Planning Interview Page
 * Personalized checklist generator based on user situation
 */

import { useState } from "react";
import { useI18n } from "@/i18n";
import Link from "next/link";
import InterviewForm from "@/components/planning/InterviewForm";
import { generatePersonalizedChecklist } from "@/lib/checklist-generator";
import { downloadChecklistPDF } from "@/components/planning/ChecklistPDF";
import type { UserSituation, PersonalizedChecklist } from "@/types/planning";

/**
 * Interview page for generating personalized planning checklist
 */
export default function PlanningInterviewPage() {
  const { t } = useI18n();
  const [checklist, setChecklist] = useState<PersonalizedChecklist | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * Handle interview completion
   */
  const handleInterviewComplete = (situation: UserSituation): void => {
    setIsGenerating(true);
    // Simulate async operation (in case we add async logic later)
    setTimeout(() => {
      const personalizedChecklist = generatePersonalizedChecklist(situation);
      setChecklist(personalizedChecklist);
      setIsGenerating(false);
    }, 100);
  };

  /**
   * Get urgency badge color
   */
  const getUrgencyColor = (urgency: string): string => {
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

  /**
   * Render results view
   */
  const renderResults = () => {
    if (!checklist) {
      return null;
    }

    return (
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">{t.planning.personalizedTool.results.title}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Based on your situation, here&apos;s your personalized action plan
          </p>
        </div>

        {/* Priority Tasks */}
        <section>
          <h2 className="text-2xl font-bold mb-4">
            {t.planning.personalizedTool.results.priorityTasks}
          </h2>
          <div className="space-y-4">
            {checklist.priorityItems.length > 0 ? (
              checklist.priorityItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-blue-500"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getUrgencyColor(
                        item.urgency
                      )}`}
                    >
                      {t.planning.urgency[item.urgency as keyof typeof t.planning.urgency]}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{item.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {item.estimatedTime && (
                      <div>
                        <strong>Time:</strong> {item.estimatedTime}
                      </div>
                    )}
                    {item.location && (
                      <div>
                        <strong>Location:</strong> {item.location}
                      </div>
                    )}
                    {item.cost && (
                      <div>
                        <strong>Cost:</strong> {item.cost}
                      </div>
                    )}
                  </div>
                  {item.helpLink && (
                    <Link
                      href={item.helpLink}
                      className="text-blue-600 dark:text-blue-400 hover:underline mt-4 inline-block"
                    >
                      Learn more →
                    </Link>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                No priority tasks found for your situation.
              </p>
            )}
          </div>
        </section>

        {/* Recommended Guides */}
        {checklist.recommendedGuides.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">
              {t.planning.personalizedTool.results.recommendedGuides}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {checklist.recommendedGuides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/planning/${guide.slug}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500"
                >
                  <h3 className="text-lg font-semibold mb-2">{guide.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{guide.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{guide.readTime}</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${getUrgencyColor(
                        guide.urgency
                      )}`}
                    >
                      {t.planning.urgency[guide.urgency as keyof typeof t.planning.urgency]}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Local Resources */}
        {checklist.cityResources && (
          <section>
            <h2 className="text-2xl font-bold mb-4">
              {t.planning.personalizedTool.results.localResources}
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4">
                {checklist.cityResources.city} ({checklist.cityResources.postcode})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Standesamt */}
                <div>
                  <h4 className="font-semibold mb-2">
                    {t.planning.cityResources.standesamt.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {checklist.cityResources.standesamt.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {checklist.cityResources.standesamt.address}
                  </p>
                  {checklist.cityResources.standesamt.phone && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t.planning.cityResources.phone}: {checklist.cityResources.standesamt.phone}
                    </p>
                  )}
                  {checklist.cityResources.standesamt.website && (
                    <a
                      href={checklist.cityResources.standesamt.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                    >
                      {t.planning.cityResources.website}
                    </a>
                  )}
                </div>

                {/* Jugendamt */}
                <div>
                  <h4 className="font-semibold mb-2">{t.planning.cityResources.jugendamt.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {checklist.cityResources.jugendamt.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {checklist.cityResources.jugendamt.address}
                  </p>
                  {checklist.cityResources.jugendamt.phone && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t.planning.cityResources.phone}: {checklist.cityResources.jugendamt.phone}
                    </p>
                  )}
                  {checklist.cityResources.jugendamt.website && (
                    <a
                      href={checklist.cityResources.jugendamt.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                    >
                      {t.planning.cityResources.website}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Next Steps */}
        {checklist.nextSteps.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">
              {t.planning.personalizedTool.results.nextSteps}
            </h2>
            <ul className="space-y-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              {checklist.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-400 mr-3 font-bold">
                    {index + 1}.
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">{step}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
          <Link
            href="/planning/checklist"
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-semibold"
          >
            View Full Checklist
          </Link>
          <button
            type="button"
            onClick={async () => {
              try {
                await downloadChecklistPDF(checklist, "en");
              } catch (error) {
                console.error("Failed to download PDF:", error);
                // Could show an error toast here
              }
            }}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            {t.planning.personalizedTool.results.downloadPDF}
          </button>
          <button
            type="button"
            onClick={() => {
              setChecklist(null);
            }}
            className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  };

  /**
   * Render interview form or loading state
   */
  if (isGenerating) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Generating your personalized plan...</p>
      </div>
    );
  }

  if (checklist) {
    return <div className="container mx-auto px-4 py-8">{renderResults()}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">{t.planning.personalizedTool.title}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {t.planning.personalizedTool.description}
        </p>
      </div>

      {/* Interview Form */}
      <InterviewForm onComplete={handleInterviewComplete} />

      {/* Back link */}
      <div className="text-center mt-8">
        <Link href="/planning" className="text-blue-600 dark:text-blue-400 hover:underline">
          {t.planning.backToPlanning}
        </Link>
      </div>
    </div>
  );
}
