/**
 * Tests for Planning Progress API
 * Tests POST and GET endpoints for saving and loading progress
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST, GET } from "../planning/progress/route";
import { supabase } from "@/lib/supabase";

// Mock Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe("Planning Progress API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/planning/progress", () => {
    it("should save progress successfully", async () => {
      const mockUpsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              checklist_id: "test-checklist-123",
              user_id: null,
              email: "test@example.com",
              completed_items: ["item1", "item2"],
              progress_data: {
                lastUpdated: "2025-01-15T10:00:00Z",
                completionPercentage: 50,
                totalItems: 4,
                completedCount: 2,
              },
            },
            error: null,
          }),
        }),
      });

      vi.mocked(supabase.from).mockReturnValue({
        upsert: mockUpsert,
      } as unknown as ReturnType<typeof supabase.from>);

      const request = new NextRequest("http://localhost/api/planning/progress", {
        method: "POST",
        body: JSON.stringify({
          checklistId: "test-checklist-123",
          email: "test@example.com",
          completedItems: ["item1", "item2"],
          progressData: {
            lastUpdated: "2025-01-15T10:00:00Z",
            completionPercentage: 50,
            totalItems: 4,
            completedCount: 2,
          },
        }),
      });

      const response = await POST(request);
      const data = (await response.json()) as { success: boolean; progress: unknown };

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.progress).toBeTruthy();
    });

    it("should return 400 if required fields are missing", async () => {
      const request = new NextRequest("http://localhost/api/planning/progress", {
        method: "POST",
        body: JSON.stringify({
          checklistId: "test-checklist-123",
          // Missing completedItems and progressData
        }),
      });

      const response = await POST(request);
      const data = (await response.json()) as { success: boolean; error: string };

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Missing required fields");
    });

    it("should return 400 if neither email nor userId is provided", async () => {
      const request = new NextRequest("http://localhost/api/planning/progress", {
        method: "POST",
        body: JSON.stringify({
          checklistId: "test-checklist-123",
          completedItems: ["item1"],
          progressData: {
            lastUpdated: "2025-01-15T10:00:00Z",
            completionPercentage: 25,
            totalItems: 4,
            completedCount: 1,
          },
          // Missing email and userId
        }),
      });

      const response = await POST(request);
      const data = (await response.json()) as { success: boolean; error: string };

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Either email or userId is required");
    });

    it("should handle database errors", async () => {
      const mockUpsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Database error" },
          }),
        }),
      });

      vi.mocked(supabase.from).mockReturnValue({
        upsert: mockUpsert,
      } as unknown as ReturnType<typeof supabase.from>);

      const request = new NextRequest("http://localhost/api/planning/progress", {
        method: "POST",
        body: JSON.stringify({
          checklistId: "test-checklist-123",
          email: "test@example.com",
          completedItems: ["item1"],
          progressData: {
            lastUpdated: "2025-01-15T10:00:00Z",
            completionPercentage: 25,
            totalItems: 4,
            completedCount: 1,
          },
        }),
      });

      const response = await POST(request);
      const data = (await response.json()) as { success: boolean; error: string };

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Failed to save progress");
    });

    it("should handle userId instead of email", async () => {
      const mockUpsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              checklist_id: "test-checklist-123",
              user_id: "user-123",
              email: null,
              completed_items: ["item1"],
              progress_data: {
                lastUpdated: "2025-01-15T10:00:00Z",
                completionPercentage: 25,
                totalItems: 4,
                completedCount: 1,
              },
            },
            error: null,
          }),
        }),
      });

      vi.mocked(supabase.from).mockReturnValue({
        upsert: mockUpsert,
      } as unknown as ReturnType<typeof supabase.from>);

      const request = new NextRequest("http://localhost/api/planning/progress", {
        method: "POST",
        body: JSON.stringify({
          checklistId: "test-checklist-123",
          userId: "user-123",
          completedItems: ["item1"],
          progressData: {
            lastUpdated: "2025-01-15T10:00:00Z",
            completionPercentage: 25,
            totalItems: 4,
            completedCount: 1,
          },
        }),
      });

      const response = await POST(request);
      const data = (await response.json()) as { success: boolean };

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe("GET /api/planning/progress", () => {
    it("should load progress by checklistId", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [
            {
              checklist_id: "test-checklist-123",
              user_id: null,
              email: "test@example.com",
              completed_items: ["item1", "item2"],
              progress_data: {
                lastUpdated: "2025-01-15T10:00:00Z",
                completionPercentage: 50,
                totalItems: 4,
                completedCount: 2,
              },
            },
          ],
          error: null,
        }),
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      const request = new NextRequest(
        "http://localhost/api/planning/progress?checklistId=test-checklist-123"
      );

      const response = await GET(request);
      const data = (await response.json()) as { success: boolean; progress: unknown };

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.progress).toBeTruthy();
    });

    it("should load progress by email", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: [
                {
                  checklist_id: "test-checklist-123",
                  user_id: null,
                  email: "test@example.com",
                  completed_items: ["item1"],
                  progress_data: {
                    lastUpdated: "2025-01-15T10:00:00Z",
                    completionPercentage: 25,
                    totalItems: 4,
                    completedCount: 1,
                  },
                },
              ],
              error: null,
            }),
          }),
        }),
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      const request = new NextRequest(
        "http://localhost/api/planning/progress?email=test@example.com"
      );

      const response = await GET(request);
      const data = (await response.json()) as { success: boolean; progress: unknown };

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.progress).toBeTruthy();
    });

    it("should load progress by userId", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: [
                {
                  checklist_id: "test-checklist-123",
                  user_id: "user-123",
                  email: null,
                  completed_items: ["item1"],
                  progress_data: {
                    lastUpdated: "2025-01-15T10:00:00Z",
                    completionPercentage: 25,
                    totalItems: 4,
                    completedCount: 1,
                  },
                },
              ],
              error: null,
            }),
          }),
        }),
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      const request = new NextRequest("http://localhost/api/planning/progress?userId=user-123");

      const response = await GET(request);
      const data = (await response.json()) as { success: boolean; progress: unknown };

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.progress).toBeTruthy();
    });

    it("should return 400 if no query parameters provided", async () => {
      const request = new NextRequest("http://localhost/api/planning/progress");

      const response = await GET(request);
      const data = (await response.json()) as { success: boolean; error: string };

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain("At least one query parameter is required");
    });

    it("should return 404 if progress not found", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      const request = new NextRequest(
        "http://localhost/api/planning/progress?checklistId=non-existent"
      );

      const response = await GET(request);
      const data = (await response.json()) as { success: boolean; error: string };

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Progress not found");
    });

    it("should handle database errors", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error" },
        }),
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      const request = new NextRequest(
        "http://localhost/api/planning/progress?checklistId=test-checklist-123"
      );

      const response = await GET(request);
      const data = (await response.json()) as { success: boolean; error: string };

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Failed to load progress");
    });
  });
});
