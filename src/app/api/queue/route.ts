import type { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

export type QueueRecord = {
  serviceId: string;
  waitMinutes: number;
  suggestedWindow?: string;
  submittedAt: number;
};

type Aggregate = {
  serviceId: string;
  avgWait: number;
  bestWindows: string[];
  count: number;
  lastSubmittedAt?: number;
};

async function readRecords(): Promise<QueueRecord[]> {
  try {
    const { data, error } = await supabase
      .from("queue_records")
      .select("service_id, wait_minutes, suggested_window, submitted_at")
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("Error reading records:", error);
      return [];
    }

    return (data || []).map((row) => ({
      serviceId: row.service_id,
      waitMinutes: row.wait_minutes,
      suggestedWindow: row.suggested_window || undefined,
      submittedAt: row.submitted_at,
    }));
  } catch {
    return [];
  }
}

async function insertRecord(record: QueueRecord): Promise<void> {
  try {
    const { error } = await supabase.from("queue_records").insert({
      service_id: record.serviceId,
      wait_minutes: record.waitMinutes,
      suggested_window: record.suggestedWindow || null,
      submitted_at: record.submittedAt,
    });

    if (error) {
      console.error("Error inserting record:", error);
      throw error;
    }
  } catch {
    // ignore
  }
}

export function aggregate(records: QueueRecord[], ids?: string[]): Aggregate[] {
  const map = new Map<string, QueueRecord[]>();
  for (const r of records) {
    if (ids && ids.length && !ids.includes(r.serviceId)) continue;
    const arr = map.get(r.serviceId) || [];
    arr.push(r);
    map.set(r.serviceId, arr);
  }
  const out: Aggregate[] = [];
  for (const [serviceId, arr] of map.entries()) {
    const avgWait = Math.round(
      arr.reduce((acc, r) => acc + (typeof r.waitMinutes === "number" ? r.waitMinutes : 0), 0) /
        Math.max(1, arr.length)
    );
    const windowsCount = new Map<string, number>();
    for (const r of arr) {
      if (r.suggestedWindow) {
        const key = r.suggestedWindow.trim();
        windowsCount.set(key, (windowsCount.get(key) || 0) + 1);
      }
    }
    const bestWindows = Array.from(windowsCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([w]) => w);
    const lastSubmittedAt = Math.max(...arr.map((r) => r.submittedAt || 0));
    out.push({ serviceId, avgWait, bestWindows, count: arr.length, lastSubmittedAt });
  }
  return out;
}

export async function GET(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get("ids");
  const ids = idsParam
    ? idsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : undefined;
  const records = await readRecords();
  const aggr = aggregate(records, ids);
  return Response.json({ aggregates: aggr });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<QueueRecord>;
    const serviceId = String(body.serviceId || "").trim();
    const wait = Number(body.waitMinutes);
    const win = (body.suggestedWindow || "").toString().slice(0, 60).trim();
    if (!serviceId || !Number.isFinite(wait) || wait <= 0 || wait > 600) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400 });
    }
    const rec: QueueRecord = {
      serviceId,
      waitMinutes: Math.round(wait),
      suggestedWindow: win || undefined,
      submittedAt: Date.now(),
    };
    await insertRecord(rec);
    return Response.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unexpected error";
    return new Response(JSON.stringify({ error: msg }), { status: 400 });
  }
}
