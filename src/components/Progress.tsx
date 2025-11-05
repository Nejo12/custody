"use client";
export default function Progress({ current, total }: { current: number; total: number }) {
  const pct = Math.round(((current + 1) / total) * 100);
  return (
    <div className="w-full">
      <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
        <div className="h-2 bg-black" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 text-xs text-zinc-700 dark:text-zinc-400">{pct}%</div>
    </div>
  );
}
