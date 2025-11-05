"use client";
type Props = {
  tone?: "info" | "warn" | "success" | "error";
  title?: string;
  children?: React.ReactNode;
};
export default function Callout({ tone = "info", title, children }: Props) {
  const textColors: Record<string, string> = {
    info: "text-sky-900 dark:text-sky-100",
    warn: "text-amber-900 dark:text-amber-100",
    success: "text-green-900 dark:text-green-100",
    error: "text-red-500 dark:text-red-400",
  };
  const borderColors: Record<string, string> = {
    info: "border-sky-400/50 dark:border-sky-900/20",
    warn: "border-amber-400/50 dark:border-amber-900/20",
    success: "border-green-400/50 dark:border-green-900/20",
    error: "border-red-400 dark:border-red-900",
  };
  const bgColors: Record<string, string> = {
    info: "bg-sky-50 dark:bg-sky-900/20",
    warn: "bg-amber-50 dark:bg-amber-900/20",
    success: "bg-green-50 dark:bg-green-900/20",
    error: "bg-red-100 dark:bg-red-900/20",
  };
  return (
    <div className={`rounded-lg border p-3 ${borderColors[tone]} ${bgColors[tone]}`}>
      {title && <div className={`text-sm font-medium mb-1 ${textColors[tone]}`}>{title}</div>}
      <div className={`text-sm ${textColors[tone]}`}>{children}</div>
    </div>
  );
}
