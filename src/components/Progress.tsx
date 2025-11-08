"use client";
import { useI18n } from "@/i18n";

export default function Progress({ current, total }: { current: number; total: number }) {
  const { t } = useI18n();
  const idx = Math.min(Math.max(current + 1, 1), total);
  const pct = Math.round((idx / total) * 100);
  return (
    <div className="w-full">
      <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-2 bg-zinc-900 dark:bg-zinc-100" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 text-xs text-zinc-700 dark:text-zinc-400">
        {t.common.step.replace("{idx}", String(idx)).replace("{total}", String(total))}
      </div>
    </div>
  );
}
