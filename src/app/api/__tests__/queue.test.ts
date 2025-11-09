import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET, POST, aggregate } from "@/app/api/queue/route";
import type { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), ".tmp", "queue.json");

describe("queue API", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    try {
      await fs.unlink(DATA_PATH);
    } catch {
      // ignore
    }
  });

  describe("aggregate function", () => {
    it("aggregates records by serviceId", () => {
      const records = [
        { serviceId: "service1", waitMinutes: 10, submittedAt: 1000 },
        { serviceId: "service1", waitMinutes: 20, submittedAt: 2000 },
        { serviceId: "service2", waitMinutes: 30, submittedAt: 3000 },
      ];
      const result = aggregate(records);
      expect(result).toHaveLength(2);
      expect(result[0].serviceId).toBe("service1");
      expect(result[0].avgWait).toBe(15);
      expect(result[0].count).toBe(2);
      expect(result[1].serviceId).toBe("service2");
      expect(result[1].avgWait).toBe(30);
    });

    it("filters by ids when provided", () => {
      const records = [
        { serviceId: "service1", waitMinutes: 10, submittedAt: 1000 },
        { serviceId: "service2", waitMinutes: 20, submittedAt: 2000 },
        { serviceId: "service3", waitMinutes: 30, submittedAt: 3000 },
      ];
      const result = aggregate(records, ["service1", "service3"]);
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.serviceId)).toEqual(["service1", "service3"]);
    });

    it("calculates best windows", () => {
      const records = [
        { serviceId: "service1", waitMinutes: 10, suggestedWindow: "morning", submittedAt: 1000 },
        { serviceId: "service1", waitMinutes: 20, suggestedWindow: "morning", submittedAt: 2000 },
        { serviceId: "service1", waitMinutes: 30, suggestedWindow: "afternoon", submittedAt: 3000 },
      ];
      const result = aggregate(records);
      expect(result[0].bestWindows).toContain("morning");
    });

    it("handles empty records", () => {
      const result = aggregate([]);
      expect(result).toHaveLength(0);
    });

    it("handles records with missing waitMinutes", () => {
      const records: Array<{ serviceId: string; waitMinutes?: number; submittedAt: number }> = [
        { serviceId: "service1", waitMinutes: 10, submittedAt: 1000 },
        { serviceId: "service1", submittedAt: 2000 },
      ];
      const result = aggregate(records);
      // When waitMinutes is undefined, it's treated as 0 in the calculation
      expect(result[0].avgWait).toBe(5);
    });
  });

  describe("GET endpoint", () => {
    it("returns aggregates", async () => {
      const req = {
        nextUrl: {
          searchParams: new URLSearchParams(),
        },
      } as unknown as NextRequest;
      const res = await GET(req);
      expect(res.ok).toBe(true);
      const json = await res.json();
      expect(json).toHaveProperty("aggregates");
      expect(Array.isArray(json.aggregates)).toBe(true);
    });

    it("filters by ids parameter", async () => {
      const searchParams = new URLSearchParams();
      searchParams.set("ids", "service1,service2");
      const req = {
        nextUrl: {
          searchParams,
        },
      } as unknown as NextRequest;
      const res = await GET(req);
      expect(res.ok).toBe(true);
    });
  });

  describe("POST endpoint", () => {
    it("creates a new record", async () => {
      const req = {
        json: async () => ({
          serviceId: "test-service",
          waitMinutes: 15,
          suggestedWindow: "morning",
        }),
      } as unknown as NextRequest;
      const res = await POST(req);
      expect(res.ok).toBe(true);
      const json = await res.json();
      expect(json).toHaveProperty("ok", true);
    });

    it("returns 400 for invalid payload - missing serviceId", async () => {
      const req = {
        json: async () => ({
          waitMinutes: 15,
        }),
      } as unknown as NextRequest;
      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json).toHaveProperty("error", "Invalid payload");
    });

    it("returns 400 for invalid payload - missing waitMinutes", async () => {
      const req = {
        json: async () => ({
          serviceId: "test-service",
        }),
      } as unknown as NextRequest;
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("returns 400 for invalid waitMinutes - too high", async () => {
      const req = {
        json: async () => ({
          serviceId: "test-service",
          waitMinutes: 1000,
        }),
      } as unknown as NextRequest;
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("returns 400 for invalid waitMinutes - negative", async () => {
      const req = {
        json: async () => ({
          serviceId: "test-service",
          waitMinutes: -5,
        }),
      } as unknown as NextRequest;
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("returns 400 for invalid waitMinutes - zero", async () => {
      const req = {
        json: async () => ({
          serviceId: "test-service",
          waitMinutes: 0,
        }),
      } as unknown as NextRequest;
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("truncates suggestedWindow to 60 characters", async () => {
      const req = {
        json: async () => ({
          serviceId: "test-service",
          waitMinutes: 15,
          suggestedWindow: "a".repeat(100),
        }),
      } as unknown as NextRequest;
      const res = await POST(req);
      expect(res.ok).toBe(true);
    });

    it("handles exception", async () => {
      const req = {
        json: async () => {
          throw new Error("Parse error");
        },
      } as unknown as NextRequest;
      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json).toHaveProperty("error");
    });

    it("rounds waitMinutes", async () => {
      const req = {
        json: async () => ({
          serviceId: "test-service",
          waitMinutes: 15.7,
        }),
      } as unknown as NextRequest;
      const res = await POST(req);
      expect(res.ok).toBe(true);
    });
  });
});
