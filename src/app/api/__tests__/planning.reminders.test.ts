/**
 * Tests for Planning Reminders API
 * Tests scheduling and retrieving planning reminders
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST, GET } from "@/app/api/planning/reminders/route";
import { supabase } from "@/lib/supabase";

// Mock Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe("Planning Reminders API", () => {
  const mockSelect = vi.fn();
  const mockInsert = vi.fn();
  const mockEq = vi.fn();
  const mockOrder = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      eq: mockEq,
      order: mockOrder,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("POST /api/planning/reminders", () => {
    it("should return 400 if required fields are missing", async () => {
      const req = new NextRequest("http://localhost/api/planning/reminders", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await POST(req);
      const data = (await response.json()) as { success: boolean; error: string };

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Missing required fields");
    });

    it("should return 400 if reminder date is invalid", async () => {
      const req = new NextRequest("http://localhost/api/planning/reminders", {
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
          itemId: "item-1",
          reminderDate: "invalid-date",
          summary: "Test reminder",
        }),
      });

      const response = await POST(req);
      const data = (await response.json()) as { success: boolean; error: string };

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid reminder date");
    });

    it("should return 400 if reminder date is in the past", async () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString();

      const req = new NextRequest("http://localhost/api/planning/reminders", {
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
          itemId: "item-1",
          reminderDate: pastDate,
          summary: "Test reminder",
        }),
      });

      const response = await POST(req);
      const data = (await response.json()) as { success: boolean; error: string };

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Reminder date must be in the future");
    });

    it("should successfully schedule a reminder", async () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      mockInsert.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 1,
              email: "test@example.com",
              item_id: "item-1",
              reminder_date: futureDate,
              summary: "Test reminder",
              status: "pending",
            },
            error: null,
          }),
        }),
      });

      const req = new NextRequest("http://localhost/api/planning/reminders", {
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
          itemId: "item-1",
          reminderDate: futureDate,
          summary: "Test reminder",
          description: "Test description",
        }),
      });

      const response = await POST(req);
      const data = (await response.json()) as { success: boolean; reminder: unknown };

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.reminder).toBeDefined();
      expect(mockInsert).toHaveBeenCalled();
    });
  });

  describe("GET /api/planning/reminders", () => {
    it("should return reminders filtered by checklistId", async () => {
      const mockReminders = [
        {
          id: 1,
          email: "test@example.com",
          checklist_id: "checklist-1",
          item_id: "item-1",
          reminder_date: new Date().toISOString(),
          summary: "Test reminder",
          status: "pending",
        },
      ];

      const mockEq = vi.fn().mockResolvedValue({
        data: mockReminders,
        error: null,
      });
      const mockOrder = vi.fn().mockReturnValue({
        eq: mockEq,
      });
      mockSelect.mockReturnValue({
        order: mockOrder,
      });

      const req = new NextRequest(
        "http://localhost/api/planning/reminders?checklistId=checklist-1"
      );

      const response = await GET(req);
      const data = (await response.json()) as { success: boolean; reminders: unknown[] };

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.reminders).toBeDefined();
      expect(Array.isArray(data.reminders)).toBe(true);
    });

    it("should return reminders filtered by email", async () => {
      const mockReminders = [
        {
          id: 1,
          email: "test@example.com",
          item_id: "item-1",
          reminder_date: new Date().toISOString(),
          summary: "Test reminder",
          status: "pending",
        },
      ];

      const mockEq = vi.fn().mockResolvedValue({
        data: mockReminders,
        error: null,
      });
      const mockOrder = vi.fn().mockReturnValue({
        eq: mockEq,
      });
      mockSelect.mockReturnValue({
        order: mockOrder,
      });

      const req = new NextRequest("http://localhost/api/planning/reminders?email=test@example.com");

      const response = await GET(req);
      const data = (await response.json()) as { success: boolean; reminders: unknown[] };

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.reminders).toBeDefined();
    });

    it("should return empty array if no reminders found", async () => {
      const mockEq = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      });
      const mockOrder = vi.fn().mockReturnValue({
        eq: mockEq,
      });
      mockSelect.mockReturnValue({
        order: mockOrder,
      });

      const req = new NextRequest("http://localhost/api/planning/reminders?email=test@example.com");

      const response = await GET(req);
      const data = (await response.json()) as { success: boolean; reminders: unknown[] };

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.reminders)).toBe(true);
      expect(data.reminders.length).toBe(0);
    });
  });
});
