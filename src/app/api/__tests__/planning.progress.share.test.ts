/**
 * Tests for Planning Progress Share API
 * Tests creating and accessing shareable progress links
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST, GET } from "@/app/api/planning/progress/share/route";
import { supabase } from "@/lib/supabase";

// Mock Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe("Planning Progress Share API", () => {
  const mockSelect = vi.fn();
  const mockUpdate = vi.fn();
  const mockSingle = vi.fn();

  // Create a chainable mock for eq() that returns itself
  const createEqMock = (): { eq: ReturnType<typeof vi.fn>; single: ReturnType<typeof vi.fn> } => {
    const eqMock = vi.fn().mockReturnValue({
      eq: createEqMock,
      single: mockSingle,
    });
    return {
      eq: eqMock,
      single: mockSingle,
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const eqChain = createEqMock();
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
      select: mockSelect.mockReturnValue(eqChain),
      update: mockUpdate,
      eq: eqChain.eq,
      single: mockSingle,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("POST /api/planning/progress/share", () => {
    it("should return 400 if checklistId is missing", async () => {
      const req = new NextRequest("http://localhost/api/planning/progress/share", {
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
        }),
      });

      const response = await POST(req);
      const data = (await response.json()) as { success: boolean; error: string };

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("checklistId is required");
    });

    it("should return 400 if neither email nor userId is provided", async () => {
      const req = new NextRequest("http://localhost/api/planning/progress/share", {
        method: "POST",
        body: JSON.stringify({
          checklistId: "checklist-1",
        }),
      });

      const response = await POST(req);
      const data = (await response.json()) as { success: boolean; error: string };

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Either email or userId is required");
    });

    it("should return 404 if progress not found", async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: "Not found" },
      });

      const req = new NextRequest("http://localhost/api/planning/progress/share", {
        method: "POST",
        body: JSON.stringify({
          checklistId: "checklist-1",
          email: "test@example.com",
        }),
      });

      const response = await POST(req);
      const data = (await response.json()) as { success: boolean; error: string };

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Progress not found or access denied");
    });

    it("should successfully create share link with email", async () => {
      const mockProgress = {
        id: 1,
        checklist_id: "checklist-1",
        email: "test@example.com",
        progress_data: {},
      };

      mockSingle.mockResolvedValue({
        data: mockProgress,
        error: null,
      });

      mockUpdate.mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: {},
          error: null,
        }),
      });

      const req = new NextRequest("http://localhost/api/planning/progress/share", {
        method: "POST",
        body: JSON.stringify({
          checklistId: "checklist-1",
          email: "test@example.com",
          expiresInDays: 30,
        }),
      });

      const response = await POST(req);
      const data = (await response.json()) as {
        success: boolean;
        shareUrl: string;
        shareToken: string;
        expiresAt: string;
      };

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.shareUrl).toBeDefined();
      expect(data.shareToken).toBeDefined();
      expect(data.expiresAt).toBeDefined();
      expect(data.shareUrl).toContain("/planning/progress/shared/");
    });

    it("should successfully create share link with userId", async () => {
      const mockProgress = {
        id: 1,
        checklist_id: "checklist-1",
        user_id: "user-123",
        progress_data: {},
      };

      mockSingle.mockResolvedValue({
        data: mockProgress,
        error: null,
      });

      mockUpdate.mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: {},
          error: null,
        }),
      });

      const req = new NextRequest("http://localhost/api/planning/progress/share", {
        method: "POST",
        body: JSON.stringify({
          checklistId: "checklist-1",
          userId: "user-123",
        }),
      });

      const response = await POST(req);
      const data = (await response.json()) as { success: boolean; shareUrl: string };

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.shareUrl).toBeDefined();
    });

    it("should use default expiration of 30 days", async () => {
      const mockProgress = {
        id: 1,
        checklist_id: "checklist-1",
        email: "test@example.com",
        progress_data: {},
      };

      mockSingle.mockResolvedValue({
        data: mockProgress,
        error: null,
      });

      mockUpdate.mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: {},
          error: null,
        }),
      });

      const req = new NextRequest("http://localhost/api/planning/progress/share", {
        method: "POST",
        body: JSON.stringify({
          checklistId: "checklist-1",
          email: "test@example.com",
        }),
      });

      const response = await POST(req);
      const data = (await response.json()) as { success: boolean; expiresAt: string };

      expect(response.status).toBe(200);
      const expiresAt = new Date(data.expiresAt);
      const now = new Date();
      const daysDiff = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBe(30);
    });
  });

  describe("GET /api/planning/progress/share", () => {
    it("should return 400 if token is missing", async () => {
      const req = new NextRequest("http://localhost/api/planning/progress/share");

      const response = await GET(req);
      const data = (await response.json()) as { success: boolean; error: string };

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Share token is required");
    });

    it("should return 404 if share link not found", async () => {
      mockSelect.mockResolvedValue({
        data: [],
        error: null,
      });

      const req = new NextRequest(
        "http://localhost/api/planning/progress/share?token=invalid-token"
      );

      const response = await GET(req);
      const data = (await response.json()) as { success: boolean; error: string };

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Share link not found or expired");
    });

    it("should return 404 if share link is expired", async () => {
      const expiredDate = new Date(Date.now() - 86400000).toISOString(); // Yesterday
      const mockProgress = {
        id: 1,
        checklist_id: "checklist-1",
        completed_items: ["item-1"],
        progress_data: {
          shareLinks: [
            {
              token: "expired-token",
              expiresAt: expiredDate,
            },
          ],
        },
      };

      mockSelect.mockResolvedValue({
        data: [mockProgress],
        error: null,
      });

      const req = new NextRequest(
        "http://localhost/api/planning/progress/share?token=expired-token"
      );

      const response = await GET(req);
      const data = (await response.json()) as { success: boolean; error: string };

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Share link not found or expired");
    });

    it("should return progress for valid token", async () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString(); // Tomorrow
      const mockProgress = {
        id: 1,
        checklist_id: "checklist-1",
        completed_items: ["item-1", "item-2"],
        progress_data: {
          completionPercentage: 50,
          totalItems: 4,
          completedCount: 2,
          shareLinks: [
            {
              token: "valid-token",
              expiresAt: futureDate,
            },
          ],
        },
        last_updated: new Date().toISOString(),
      };

      mockSelect.mockResolvedValue({
        data: [mockProgress],
        error: null,
      });

      const req = new NextRequest("http://localhost/api/planning/progress/share?token=valid-token");

      const response = await GET(req);
      const data = (await response.json()) as {
        success: boolean;
        progress: {
          checklistId: string;
          completedItems: string[];
          progressData: {
            completionPercentage: number;
            totalItems: number;
            completedCount: number;
          };
        };
      };

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.progress).toBeDefined();
      expect(data.progress.checklistId).toBe("checklist-1");
      expect(data.progress.completedItems).toEqual(["item-1", "item-2"]);
      expect(data.progress.progressData.completionPercentage).toBe(50);
    });
  });
});
