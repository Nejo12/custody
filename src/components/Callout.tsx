"use client";
type Props = { tone?: 'info'|'warn'|'success'|'error'; title?: string; children?: React.ReactNode };
export default function Callout({ tone='info', title, children }: Props) {
  const palette: Record<string, string> = {
    info: 'border-sky-400/50 bg-sky-50 dark:bg-sky-900/20',
    warn: 'border-amber-500/50 bg-amber-50 dark:bg-amber-900/20',
    success: 'border-green-500/50 bg-green-50 dark:bg-green-900/20',
    error: 'border-red-500/50 bg-red-50 dark:bg-red-900/20',
  };
  return (
    <div className={`rounded-lg border p-3 ${palette[tone]}`}>
      {title && <div className="text-sm font-medium mb-1">{title}</div>}
      <div className="text-sm text-zinc-700 dark:text-zinc-200">{children}</div>
    </div>
  );
}

