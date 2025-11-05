"use client";
type Props = {
  title: string;
  message?: string;
  confidence?: number;
  tone?: "success" | "warn" | "error" | "info";
};
export default function StatusCard({ title, message, confidence, tone = "info" }: Props) {
  const toneClasses: Record<string, string> = {
    success: "border-green-500/40 bg-green-50 dark:bg-green-900/20",
    warn: "border-amber-500/40 bg-amber-50 dark:bg-amber-900/20",
    error: "border-red-500/40 bg-red-50 dark:bg-red-900/20",
    info: "border-zinc-300 bg-white dark:bg-zinc-900",
  };
  return (
    <div className={`rounded-lg border p-4 ${toneClasses[tone]}`}>
      <div className="text-2xl text-zinc-900 dark:text-zinc-100">{title}</div>
      {message && <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-2">{message}</p>}
      {typeof confidence === "number" && (
        <div className="text-xs text-zinc-700 dark:text-zinc-400 mt-2">
          Confidence: {Math.round(confidence * 100)}%
        </div>
      )}
    </div>
  );
}
