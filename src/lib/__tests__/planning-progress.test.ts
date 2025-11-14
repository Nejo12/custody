/**
 * Tests for Planning Progress Library
 * Tests localStorage operations, progress data creation, and Supabase sync
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  generateChecklistId,
  saveProgressToLocalStorage,
  loadProgressFromLocalStorage,
  createProgressData,
  saveProgress,
  loadProgress,
  syncProgress,
  setToProgress,
  progressToSet,
  type ChecklistProgress,
} from "../planning-progress";
import type { ChecklistItem } from "@/types/planning";

// Mock fetch for Supabase sync tests
global.fetch = vi.fn();

describe("planning-progress", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("generateChecklistId", () => {
    it("should generate a unique checklist ID", () => {
      const id1 = generateChecklistId();
      const id2 = generateChecklistId();

      expect(id1).toMatch(/^checklist_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^checklist_\d+_[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });

    it("should generate IDs with correct format", () => {
      const id = generateChecklistId();
      expect(id).toContain("checklist_");
      expect(id.length).toBeGreaterThan(20);
    });
  });

  describe("saveProgressToLocalStorage", () => {
    it("should save progress to localStorage", () => {
      const progress: ChecklistProgress = {
        checklistId: "test-checklist-123",
        completedItems: ["item1", "item2"],
        progressData: {
          lastUpdated: "2025-01-15T10:00:00Z",
          completionPercentage: 50,
          totalItems: 4,
          completedCount: 2,
        },
      };

      saveProgressToLocalStorage(progress);

      const stored = localStorage.getItem("planning_progress_test-checklist-123");
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored as string) as ChecklistProgress;
      expect(parsed.checklistId).toBe(progress.checklistId);
      expect(parsed.completedItems).toEqual(progress.completedItems);
    });

    it("should handle errors gracefully", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const progress: ChecklistProgress = {
        checklistId: "test-checklist-123",
        completedItems: [],
        progressData: {
          lastUpdated: "2025-01-15T10:00:00Z",
          completionPercentage: 0,
          totalItems: 4,
          completedCount: 0,
        },
      };

      // Mock localStorage.setItem to throw an error
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error("Storage quota exceeded");
      });

      saveProgressToLocalStorage(progress);

      expect(consoleSpy).toHaveBeenCalled();

      // Restore original
      Storage.prototype.setItem = originalSetItem;
      consoleSpy.mockRestore();
    });
  });

  describe("loadProgressFromLocalStorage", () => {
    it("should load progress from localStorage", () => {
      const progress: ChecklistProgress = {
        checklistId: "test-checklist-123",
        completedItems: ["item1", "item2"],
        progressData: {
          lastUpdated: "2025-01-15T10:00:00Z",
          completionPercentage: 50,
          totalItems: 4,
          completedCount: 2,
        },
      };

      localStorage.setItem("planning_progress_test-checklist-123", JSON.stringify(progress));

      const loaded = loadProgressFromLocalStorage("test-checklist-123");
      expect(loaded).toEqual(progress);
    });

    it("should return null if progress not found", () => {
      const loaded = loadProgressFromLocalStorage("non-existent-checklist");
      expect(loaded).toBeNull();
    });

    it("should handle invalid JSON gracefully", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      localStorage.setItem("planning_progress_test-checklist-123", "invalid json");

      const loaded = loadProgressFromLocalStorage("test-checklist-123");
      expect(loaded).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("createProgressData", () => {
    it("should create progress data with correct completion percentage", () => {
      const completedItems = new Set<string>(["item1", "item2"]);
      const progress = createProgressData("test-checklist-123", completedItems, 4);

      expect(progress.checklistId).toBe("test-checklist-123");
      expect(progress.completedItems).toEqual(["item1", "item2"]);
      expect(progress.progressData.completionPercentage).toBe(50);
      expect(progress.progressData.totalItems).toBe(4);
      expect(progress.progressData.completedCount).toBe(2);
      expect(progress.progressData.lastUpdated).toBeTruthy();
    });

    it("should handle zero total items", () => {
      const completedItems = new Set<string>([]);
      const progress = createProgressData("test-checklist-123", completedItems, 0);

      expect(progress.progressData.completionPercentage).toBe(0);
      expect(progress.progressData.totalItems).toBe(0);
    });

    it("should handle 100% completion", () => {
      const completedItems = new Set<string>(["item1", "item2", "item3", "item4"]);
      const progress = createProgressData("test-checklist-123", completedItems, 4);

      expect(progress.progressData.completionPercentage).toBe(100);
      expect(progress.progressData.completedCount).toBe(4);
    });
  });

  describe("saveProgress", () => {
    it("should save to localStorage", () => {
      const progress: ChecklistProgress = {
        checklistId: "test-checklist-123",
        completedItems: ["item1"],
        progressData: {
          lastUpdated: "2025-01-15T10:00:00Z",
          completionPercentage: 25,
          totalItems: 4,
          completedCount: 1,
        },
      };

      saveProgress(progress);

      const stored = localStorage.getItem("planning_progress_test-checklist-123");
      expect(stored).toBeTruthy();
    });

    it("should sync to Supabase when option is enabled", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const progress: ChecklistProgress = {
        checklistId: "test-checklist-123",
        completedItems: ["item1"],
        progressData: {
          lastUpdated: "2025-01-15T10:00:00Z",
          completionPercentage: 25,
          totalItems: 4,
          completedCount: 1,
        },
      };

      await saveProgress(progress, {
        email: "test@example.com",
        syncToSupabase: true,
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/planning/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          checklistId: progress.checklistId,
          email: "test@example.com",
          completedItems: progress.completedItems,
          progressData: progress.progressData,
        }),
      });
    });

    it("should not sync to Supabase when option is disabled", async () => {
      const mockFetch = vi.mocked(fetch);

      const progress: ChecklistProgress = {
        checklistId: "test-checklist-123",
        completedItems: ["item1"],
        progressData: {
          lastUpdated: "2025-01-15T10:00:00Z",
          completionPercentage: 25,
          totalItems: 4,
          completedCount: 1,
        },
      };

      await saveProgress(progress, {
        syncToSupabase: false,
      });

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should handle Supabase sync errors gracefully", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const progress: ChecklistProgress = {
        checklistId: "test-checklist-123",
        completedItems: ["item1"],
        progressData: {
          lastUpdated: "2025-01-15T10:00:00Z",
          completionPercentage: 25,
          totalItems: 4,
          completedCount: 1,
        },
      };

      await saveProgress(progress, {
        email: "test@example.com",
        syncToSupabase: true,
      });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("loadProgress", () => {
    it("should load from localStorage by default", async () => {
      const progress: ChecklistProgress = {
        checklistId: "test-checklist-123",
        completedItems: ["item1"],
        progressData: {
          lastUpdated: "2025-01-15T10:00:00Z",
          completionPercentage: 25,
          totalItems: 4,
          completedCount: 1,
        },
      };

      localStorage.setItem("planning_progress_test-checklist-123", JSON.stringify(progress));

      const loaded = await loadProgress("test-checklist-123");
      expect(loaded).toEqual(progress);
    });

    it("should load from Supabase when requested", async () => {
      const mockFetch = vi.mocked(fetch);
      const progress: ChecklistProgress = {
        checklistId: "test-checklist-123",
        completedItems: ["item1"],
        progressData: {
          lastUpdated: "2025-01-15T10:00:00Z",
          completionPercentage: 25,
          totalItems: 4,
          completedCount: 1,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, progress }),
      } as Response);

      const loaded = await loadProgress("test-checklist-123", {
        email: "test@example.com",
        loadFromSupabase: true,
      });

      expect(loaded).toEqual(progress);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/planning/progress?checklistId=test-checklist-123&email=test%40example.com"
      );
    });

    it("should fall back to localStorage if Supabase fails", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const progress: ChecklistProgress = {
        checklistId: "test-checklist-123",
        completedItems: ["item1"],
        progressData: {
          lastUpdated: "2025-01-15T10:00:00Z",
          completionPercentage: 25,
          totalItems: 4,
          completedCount: 1,
        },
      };

      localStorage.setItem("planning_progress_test-checklist-123", JSON.stringify(progress));

      const loaded = await loadProgress("test-checklist-123", {
        email: "test@example.com",
        loadFromSupabase: true,
      });

      expect(loaded).toEqual(progress);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("syncProgress", () => {
    it("should call loadProgress with loadFromSupabase option", async () => {
      const mockFetch = vi.mocked(fetch);
      const progress: ChecklistProgress = {
        checklistId: "test-checklist-123",
        completedItems: ["item1"],
        progressData: {
          lastUpdated: "2025-01-15T10:00:00Z",
          completionPercentage: 25,
          totalItems: 4,
          completedCount: 1,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, progress }),
      } as Response);

      const synced = await syncProgress("test-checklist-123", "test@example.com");

      expect(synced).toEqual(progress);
    });
  });

  describe("setToProgress", () => {
    it("should convert Set to progress data", () => {
      const items: ChecklistItem[] = [
        {
          id: "item1",
          title: "Item 1",
          description: "Description 1",
          stage: "expecting",
          urgency: "high",
        },
        {
          id: "item2",
          title: "Item 2",
          description: "Description 2",
          stage: "expecting",
          urgency: "medium",
        },
      ];

      const completedItems = new Set<string>(["item1"]);
      const progress = setToProgress("test-checklist-123", completedItems, items);

      expect(progress.checklistId).toBe("test-checklist-123");
      expect(progress.completedItems).toEqual(["item1"]);
      expect(progress.progressData.totalItems).toBe(2);
      expect(progress.progressData.completedCount).toBe(1);
      expect(progress.progressData.completionPercentage).toBe(50);
    });
  });

  describe("progressToSet", () => {
    it("should convert progress data to Set", () => {
      const progress: ChecklistProgress = {
        checklistId: "test-checklist-123",
        completedItems: ["item1", "item2"],
        progressData: {
          lastUpdated: "2025-01-15T10:00:00Z",
          completionPercentage: 50,
          totalItems: 4,
          completedCount: 2,
        },
      };

      const set = progressToSet(progress);
      expect(set).toBeInstanceOf(Set);
      expect(set.has("item1")).toBe(true);
      expect(set.has("item2")).toBe(true);
      expect(set.size).toBe(2);
    });
  });
});
