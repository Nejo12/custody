"use client";
import Link from "next/link";
import { useI18n } from "@/i18n";
import { useState, useMemo, useEffect, useCallback } from "react";
import planningDataEn from "@/data/planning.json";
import type { ChecklistItem, PlanningStage } from "@/types/planning";

/**
 * Lazy load locale-specific planning data
 * Loads translated planning checklist based on current locale
 * Falls back to English if translation unavailable
 */
const loadPlanning = async (locale: string) => {
  // Only load German for now, other languages fall back to English
  // TODO: Add other language files as they become available
  if (locale === "de") {
    try {
      return (await import("@/data/planning.de.json")).default;
    } catch {
      console.warn("German planning data not found, falling back to English");
      return planningDataEn;
    }
  }

  // Default to English for all other locales
  return planningDataEn;
};
import {
  generateChecklistId,
  saveProgress,
  loadProgress,
  progressToSet,
  setToProgress,
} from "@/lib/planning-progress";
import {
  checkNotificationSupport,
  requestNotificationPermission,
  scheduleDeadlineNotifications,
  cancelDeadlineNotifications,
  getNotificationPermission,
} from "@/lib/planning-notifications";
import ProgressShareButton from "@/components/planning/ProgressShareButton";

/**
 * Interactive Checklist Page
 * Allows users to track their progress through essential legal steps
 * Includes filtering by stage and completion status
 * Progress is persisted to localStorage and optionally synced to Supabase
 */
export default function ChecklistPage() {
  // Get i18n translation function and current locale
  const { t, locale } = useI18n();

  // State for locale-specific planning data
  const [planningData, setPlanningData] = useState(planningDataEn);

  // Load locale-specific data when locale changes
  useEffect(() => {
    loadPlanning(locale).then((data) => setPlanningData(data));
  }, [locale]);

  // Generate or load checklist ID (persisted across sessions)
  const [checklistId] = useState<string>(() => {
    if (typeof window === "undefined") {
      return generateChecklistId();
    }
    // Try to load existing checklist ID from localStorage
    const storedId = localStorage.getItem("planning_checklist_id");
    if (storedId) {
      return storedId;
    }
    // Generate new ID and store it
    const newId = generateChecklistId();
    localStorage.setItem("planning_checklist_id", newId);
    return newId;
  });

  // State for completed items (stored as Set of item IDs)
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  // State for selected stage filter
  const [selectedStage, setSelectedStage] = useState<PlanningStage | "all">("all");

  // State for showing/hiding completed items
  const [showCompleted, setShowCompleted] = useState<boolean>(true);

  // State for loading progress
  const [isLoadingProgress, setIsLoadingProgress] = useState<boolean>(true);

  // State for notification permission
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission | null>(null);

  // Get checklist items from planning data
  const checklistItems = planningData.checklist as ChecklistItem[];

  /**
   * Check notification support and permission on mount
   */
  useEffect(() => {
    if (typeof window !== "undefined" && checkNotificationSupport()) {
      setNotificationPermission(getNotificationPermission());
    }
  }, []);

  /**
   * Load progress from localStorage on mount
   */
  useEffect(() => {
    const loadSavedProgress = async (): Promise<void> => {
      try {
        setIsLoadingProgress(true);
        const savedProgress = await loadProgress(checklistId);
        if (savedProgress) {
          setCompletedItems(progressToSet(savedProgress));
        }
      } catch (error) {
        console.error("Error loading progress:", error);
      } finally {
        setIsLoadingProgress(false);
      }
    };

    loadSavedProgress();
  }, [checklistId]);

  /**
   * Schedule deadline notifications for incomplete items with deadlines
   */
  useEffect(() => {
    if (notificationPermission !== "granted" || isLoadingProgress) {
      return;
    }

    // Schedule notifications for items with deadlines that are not completed
    checklistItems.forEach((item) => {
      if (item.deadline && !completedItems.has(item.id)) {
        const deadlineDate = new Date(item.deadline);
        if (deadlineDate > new Date()) {
          scheduleDeadlineNotifications({
            itemId: item.id,
            title: item.title,
            deadline: deadlineDate,
            description: item.description,
            reminderDaysBefore: [7, 1, 0], // 7 days before, 1 day before, and on deadline
          });
        }
      }
    });

    // Cleanup: cancel notifications for completed items
    return () => {
      checklistItems.forEach((item) => {
        if (completedItems.has(item.id)) {
          cancelDeadlineNotifications(item.id);
        }
      });
    };
  }, [checklistItems, completedItems, notificationPermission, isLoadingProgress]);

  /**
   * Handle notification permission request
   */
  const handleRequestNotificationPermission = async (): Promise<void> => {
    try {
      const permission = await requestNotificationPermission();
      setNotificationPermission(permission);
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  };

  /**
   * Save progress whenever completed items change
   */
  useEffect(() => {
    if (isLoadingProgress) {
      return; // Don't save while loading
    }

    const saveProgressDebounced = async (): Promise<void> => {
      try {
        const progress = setToProgress(checklistId, completedItems, checklistItems);
        await saveProgress(progress, {
          syncToSupabase: false, // Can be enabled when user is authenticated
        });
      } catch (error) {
        console.error("Error saving progress:", error);
      }
    };

    // Debounce saves to avoid excessive localStorage writes
    const timeoutId = setTimeout(() => {
      saveProgressDebounced();
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [checklistId, completedItems, checklistItems, isLoadingProgress]);

  /**
   * Toggle completion status of a checklist item
   */
  const toggleItem = useCallback((itemId: string): void => {
    setCompletedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  /**
   * Filter and sort checklist items
   * Filters by stage and completion status, sorts by urgency
   */
  const filteredItems = useMemo(() => {
    let items = checklistItems;

    // Filter by stage
    if (selectedStage !== "all") {
      items = items.filter((item) => item.stage === selectedStage);
    }

    // Filter by completion status
    if (!showCompleted) {
      items = items.filter((item) => !completedItems.has(item.id));
    }

    // Sort by urgency (critical > high > medium > low)
    const urgencyOrder: Record<string, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };

    return items.sort((a, b) => {
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });
  }, [checklistItems, selectedStage, showCompleted, completedItems]);

  /**
   * Calculate completion percentage
   */
  const completionPercentage = useMemo(() => {
    if (checklistItems.length === 0) return 0;
    return Math.round((completedItems.size / checklistItems.length) * 100);
  }, [checklistItems.length, completedItems.size]);

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

  /**
   * Map stage IDs to translated labels
   */
  const stageLabels: Record<string, string> = {
    expecting: t.planning?.categories?.expecting || "Expecting",
    "at-birth": t.planning?.categories?.atBirth || "At Birth",
    "first-year": t.planning?.categories?.firstYear || "First Year",
    "early-warning": t.planning?.categories?.earlyWarning || "Relationship Trouble",
  };

  /**
   * Map urgency levels to translated labels
   */
  const urgencyLabels: Record<string, string> = {
    critical: t.planning?.urgency?.critical || "Critical",
    high: t.planning?.urgency?.high || "High Priority",
    medium: t.planning?.urgency?.medium || "Medium Priority",
    low: t.planning?.urgency?.low || "Important",
  };

  // Stage options for filtering
  const stages: Array<{ id: PlanningStage | "all"; label: string }> = [
    { id: "all", label: t.planning?.checklist?.allStages || "All Stages" },
    { id: "expecting", label: stageLabels["expecting"] },
    { id: "at-birth", label: stageLabels["at-birth"] },
    { id: "first-year", label: stageLabels["first-year"] },
    { id: "early-warning", label: stageLabels["early-warning"] },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Back link */}
      <Link
        href="/planning"
        className="text-sm text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors inline-block"
      >
        {t.planning?.backToPlanning || "← Back to Planning"}
      </Link>

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold mb-2 text-zinc-900 dark:text-zinc-50">
          {t.planning?.checklist?.title || "Your Prevention Checklist"}
        </h1>
        <p className="text-sm text-zinc-700 dark:text-zinc-400">
          {t.planning?.checklist?.description ||
            "Track your progress through essential legal and administrative tasks. Never miss a critical deadline."}
        </p>
      </div>

      {/* Progress bar */}
      <div className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t.planning?.checklist?.overallProgress || "Overall Progress"}
          </span>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {completedItems.size} / {checklistItems.length}{" "}
            {t.planning?.checklist?.completed || "completed"}
          </span>
        </div>
        <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500 rounded-full"
            style={{ width: `${completionPercentage}%` }}
            role="progressbar"
            aria-valuenow={completionPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${completionPercentage}% ${t.planning?.checklist?.complete || "complete"}`}
          />
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">
          {completionPercentage}% {t.planning?.checklist?.complete || "complete"}
        </p>
      </div>

      {/* Actions: Notifications and Sharing */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Notification permission button */}
        {checkNotificationSupport() && notificationPermission !== "granted" && (
          <button
            onClick={handleRequestNotificationPermission}
            className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors text-sm font-medium"
          >
            {t.planning?.checklist?.enableNotifications || "Enable Browser Notifications"}
          </button>
        )}
        {notificationPermission === "granted" && (
          <div className="px-4 py-2 rounded-lg border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10 text-green-800 dark:text-green-400 text-sm font-medium">
            {t.planning?.checklist?.notificationsEnabled || "Notifications Enabled"}
          </div>
        )}

        {/* Progress sharing */}
        <div className="flex-1">
          <ProgressShareButton checklistId={checklistId} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Stage filter */}
        <div className="flex-1">
          <label
            htmlFor="stage-filter"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
          >
            {t.planning?.checklist?.filterByStage || "Filter by Stage"}
          </label>
          <select
            id="stage-filter"
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value as PlanningStage | "all")}
            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            {stages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.label}
              </option>
            ))}
          </select>
        </div>

        {/* Show completed toggle */}
        <div className="flex items-end">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors text-sm font-medium"
            aria-pressed={showCompleted}
          >
            {showCompleted
              ? t.planning?.checklist?.hideCompleted || "Hide Completed"
              : t.planning?.checklist?.showCompleted || "Show Completed"}
          </button>
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => {
            const isCompleted = completedItems.has(item.id);
            return (
              <div
                key={item.id}
                className={`rounded-lg border p-5 transition-all ${
                  isCompleted
                    ? "border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/10"
                    : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleItem(item.id)}
                    className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                      isCompleted
                        ? "bg-green-500 border-green-500"
                        : "border-zinc-300 dark:border-zinc-600 hover:border-blue-500 dark:hover:border-blue-400"
                    }`}
                    aria-label={
                      isCompleted
                        ? t.planning?.checklist?.markPending || "Mark as pending"
                        : t.planning?.checklist?.markComplete || "Mark as complete"
                    }
                    aria-checked={isCompleted}
                    role="checkbox"
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
                  </button>

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
                    <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
                      <span
                        className={`px-2 py-1 rounded border font-medium ${getUrgencyColor(item.urgency)}`}
                      >
                        {urgencyLabels[item.urgency] || item.urgency}
                      </span>
                      <span className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                        {stageLabels[item.stage] || item.stage}
                      </span>
                      {item.estimatedTime && (
                        <span className="text-zinc-600 dark:text-zinc-400">
                          ⏱️ {item.estimatedTime}
                        </span>
                      )}
                      {item.location && (
                        <span className="text-zinc-600 dark:text-zinc-400">📍 {item.location}</span>
                      )}
                      {item.cost && (
                        <span className="text-zinc-600 dark:text-zinc-400">💶 {item.cost}</span>
                      )}
                    </div>

                    {/* Help link (if available) */}
                    {item.helpLink && (
                      <Link
                        href={item.helpLink}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Learn more →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          // No items message
          <div className="text-center py-12">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              No items to show
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {showCompleted
                ? "Try selecting a different stage"
                : "All items in this category are completed!"}
            </p>
          </div>
        )}
      </div>

      {/* Help text */}
      <div className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-4 text-sm text-zinc-700 dark:text-zinc-400">
        <p className="mb-2">
          <strong>💡 {t.planning?.checklist?.tip || "Tip"}:</strong>{" "}
          {t.planning?.checklist?.progressTip ||
            "Your progress is automatically saved in your browser. It will persist across sessions, so you can come back anytime to continue where you left off."}
        </p>
        <p>
          {t.planning?.checklist?.instructions ||
            "Click on any item to mark it as complete or incomplete. Use the filters to focus on specific stages or hide completed tasks."}
        </p>
      </div>
    </div>
  );
}
