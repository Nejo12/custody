import type { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";

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

const DATA_PATH = path.join(process.cwd(), ".tmp", "queue.json");

async function ensureStore(): Promise<void> {
  try {
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    await fs.access(DATA_PATH).catch(async () => {
      await fs.writeFile(DATA_PATH, JSON.stringify({ records: [] as QueueRecord[] }));
    });
  } catch {
    // ignore
  }
}

async function readRecords(): Promise<QueueRecord[]> {
  try {
    await ensureStore();
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    const json = JSON.parse(raw) as { records?: QueueRecord[] };
    return Array.isArray(json.records) ? json.records : [];
  } catch {
    return [];
  }
}

async function writeRecords(records: QueueRecord[]): Promise<void> {
  try {
    await ensureStore();
    await fs.writeFile(DATA_PATH, JSON.stringify({ records }));
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
    const records = await readRecords();
    records.push(rec);
    await writeRecords(records);
    return Response.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unexpected error";
    return new Response(JSON.stringify({ error: msg }), { status: 400 });
  }
}
