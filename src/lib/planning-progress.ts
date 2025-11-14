/**
 * Planning Progress Library
 * Handles saving, loading, and syncing planning checklist progress
 * Supports both localStorage (client-side) and Supabase (server-side)
 */

import type { ChecklistItem } from "@/types/planning";

/**
 * Progress data structure
 */
export interface ChecklistProgress {
  checklistId: string;
  completedItems: string[]; // Array of item IDs
  progressData: {
    lastUpdated: string;
    completionPercentage: number;
    totalItems: number;
    completedCount: number;
  };
}

/**
 * Generate a unique checklist ID for anonymous users
 */
export function generateChecklistId(): string {
  return `checklist_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Save progress to localStorage
 */
export function saveProgressToLocalStorage(progress: ChecklistProgress): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const key = `planning_progress_${progress.checklistId}`;
    localStorage.setItem(key, JSON.stringify(progress));
  } catch (error) {
    console.error("Error saving progress to localStorage:", error);
  }
}

/**
 * Load progress from localStorage
 */
export function loadProgressFromLocalStorage(checklistId: string): ChecklistProgress | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const key = `planning_progress_${checklistId}`;
    const stored = localStorage.getItem(key);
    if (!stored) {
      return null;
    }
    return JSON.parse(stored) as ChecklistProgress;
  } catch (error) {
    console.error("Error loading progress from localStorage:", error);
    return null;
  }
}

/**
 * Create progress data from completed items
 */
export function createProgressData(
  checklistId: string,
  completedItems: Set<string>,
  totalItems: number
): ChecklistProgress {
  const completedArray = Array.from(completedItems);
  const completionPercentage =
    totalItems > 0 ? Math.round((completedArray.length / totalItems) * 100) : 0;

  return {
    checklistId,
    completedItems: completedArray,
    progressData: {
      lastUpdated: new Date().toISOString(),
      completionPercentage,
      totalItems,
      completedCount: completedArray.length,
    },
  };
}

/**
 * Save progress (localStorage + optional Supabase sync)
 */
export async function saveProgress(
  progress: ChecklistProgress,
  options?: {
    email?: string;
    userId?: string;
    syncToSupabase?: boolean;
  }
): Promise<void> {
  // Always save to localStorage
  saveProgressToLocalStorage(progress);

  // Optionally sync to Supabase
  if (options?.syncToSupabase && (options.email || options.userId)) {
    try {
      const response = await fetch("/api/planning/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          checklistId: progress.checklistId,
          email: options.email,
          userId: options.userId,
          completedItems: progress.completedItems,
          progressData: progress.progressData,
        }),
      });

      if (!response.ok) {
        console.error("Failed to sync progress to Supabase:", await response.text());
      }
    } catch (error) {
      console.error("Error syncing progress to Supabase:", error);
    }
  }
}

/**
 * Load progress (from localStorage or Supabase)
 */
export async function loadProgress(
  checklistId: string,
  options?: {
    email?: string;
    userId?: string;
    loadFromSupabase?: boolean;
  }
): Promise<ChecklistProgress | null> {
  // Try localStorage first
  const localProgress = loadProgressFromLocalStorage(checklistId);
  if (localProgress && !options?.loadFromSupabase) {
    return localProgress;
  }

  // Try Supabase if requested
  if (options?.loadFromSupabase && (options.email || options.userId)) {
    try {
      const params = new URLSearchParams({
        checklistId,
      });
      if (options.email) {
        params.append("email", options.email);
      }
      if (options.userId) {
        params.append("userId", options.userId);
      }

      const response = await fetch(`/api/planning/progress?${params.toString()}`);
      if (response.ok) {
        const data = (await response.json()) as { progress: ChecklistProgress };
        if (data.progress) {
          // Also save to localStorage for offline access
          saveProgressToLocalStorage(data.progress);
          return data.progress;
        }
      }
    } catch (error) {
      console.error("Error loading progress from Supabase:", error);
    }
  }

  // Fall back to localStorage
  return localProgress;
}

/**
 * Sync progress from Supabase to localStorage
 */
export async function syncProgress(
  checklistId: string,
  email?: string,
  userId?: string
): Promise<ChecklistProgress | null> {
  return loadProgress(checklistId, {
    email,
    userId,
    loadFromSupabase: true,
  });
}

/**
 * Convert Set<string> to progress data
 */
export function setToProgress(
  checklistId: string,
  completedItems: Set<string>,
  allItems: ChecklistItem[]
): ChecklistProgress {
  return createProgressData(checklistId, completedItems, allItems.length);
}

/**
 * Convert progress data to Set<string>
 */
export function progressToSet(progress: ChecklistProgress): Set<string> {
  return new Set(progress.completedItems);
}
