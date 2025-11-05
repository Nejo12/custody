import { describe, it, expect } from "vitest";
import { aggregate, type QueueRecord } from "@/app/api/queue/route";

describe("queue aggregate", () => {
  it("computes averages and best windows", () => {
    const records: QueueRecord[] = [
      { serviceId: "svc1", waitMinutes: 30, submittedAt: Date.now(), suggestedWindow: "9-11" },
      { serviceId: "svc1", waitMinutes: 60, submittedAt: Date.now(), suggestedWindow: "9-11" },
      { serviceId: "svc1", waitMinutes: 30, submittedAt: Date.now(), suggestedWindow: "13-14" },
      { serviceId: "svc2", waitMinutes: 10, submittedAt: Date.now() },
    ];
    const out = aggregate(records);
    const a1 = out.find((a) => a.serviceId === "svc1");
    expect(a1?.avgWait).toBe(40);
    expect(a1?.bestWindows[0]).toBe("9-11");
    const a2 = out.find((a) => a.serviceId === "svc2");
    expect(a2?.avgWait).toBe(10);
  });
});
