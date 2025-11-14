"use client";

/**
 * Shared Progress Page
 * Displays planning checklist progress from a share link
 */

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import planningData from "@/data/planning.json";
import type { ChecklistItem } from "@/types/planning";

/**
 * Interface for shared progress data
 */
interface SharedProgress {
  checklistId: string;
  completedItems: string[];
  progressData: {
    completionPercentage: number;
    totalItems: number;
    completedCount: number;
  };
  lastUpdated: string;
}

/**
 * Page to view shared planning progress
 */
export default function SharedProgressPage() {
  const params = useParams();
  const token = params.token as string;

  const [progress, setProgress] = useState<SharedProgress | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load shared progress from API
   */
  useEffect(() => {
    const loadSharedProgress = async (): Promise<void> => {
      if (!token) {
        setError("Invalid share link");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/planning/progress/share?token=${encodeURIComponent(token)}`
        );

        const data = (await response.json()) as {
          success: boolean;
          progress?: SharedProgress;
          error?: string;
        };

        if (!response.ok || !data.success || !data.progress) {
          throw new Error(data.error || "Failed to load shared progress");
        }

        setProgress(data.progress);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load shared progress");
      } finally {
        setIsLoading(false);
      }
    };

    loadSharedProgress();
  }, [token]);

  /**
   * Get checklist items
   */
  const checklistItems = planningData.checklist as ChecklistItem[];
  const completedItemsSet = new Set(progress?.completedItems || []);

  /**
   * Get urgency badge colors
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

  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading shared progress...</p>
        </div>
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
            Unable to Load Progress
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            {error || "The share link may be invalid or expired."}
          </p>
          <Link
            href="/planning"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Go to Planning
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold mb-2 text-zinc-900 dark:text-zinc-50">
          Shared Planning Progress
        </h1>
        <p className="text-sm text-zinc-700 dark:text-zinc-400">
          This is a read-only view of shared checklist progress.
        </p>
      </div>

      {/* Progress bar */}
      <div className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Overall Progress
          </span>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {progress.progressData.completedCount} / {progress.progressData.totalItems} completed
          </span>
        </div>
        <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500 rounded-full"
            style={{ width: `${progress.progressData.completionPercentage}%` }}
            role="progressbar"
            aria-valuenow={progress.progressData.completionPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${progress.progressData.completionPercentage}% complete`}
          />
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">
          {progress.progressData.completionPercentage}% complete
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
          Last updated: {new Date(progress.lastUpdated).toLocaleDateString()}
        </p>
      </div>

      {/* Checklist items */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Checklist Items</h2>
        {checklistItems.map((item) => {
          const isCompleted = completedItemsSet.has(item.id);
          return (
            <div
              key={item.id}
              className={`rounded-lg border p-5 ${
                isCompleted
                  ? "border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/10"
                  : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox indicator (read-only) */}
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center ${
                    isCompleted
                      ? "bg-green-500 border-green-500"
                      : "border-zinc-300 dark:border-zinc-600"
                  }`}
                >
                  {isCompleted && (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>

                {/* Item content */}
                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-semibold mb-2 ${
                      isCompleted
                        ? "text-zinc-600 dark:text-zinc-400 line-through"
                        : "text-zinc-900 dark:text-zinc-100"
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-3">
                    {item.description}
                  </p>

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={`px-2 py-1 rounded border font-medium ${getUrgencyColor(item.urgency)}`}
                    >
                      {item.urgency}
                    </span>
                    {item.estimatedTime && (
                      <span className="text-zinc-600 dark:text-zinc-400">
                        ⏱️ {item.estimatedTime}
                      </span>
                    )}
                    {item.location && (
                      <span className="text-zinc-600 dark:text-zinc-400">📍 {item.location}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="text-center pt-6 border-t border-zinc-300 dark:border-zinc-700">
        <Link href="/planning" className="text-blue-600 dark:text-blue-400 hover:underline">
          Create your own checklist →
        </Link>
      </div>
    </div>
  );
}
