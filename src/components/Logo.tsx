export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 shadow-sm ring-1 ring-slate-900/40">
        <svg
          aria-hidden="true"
          viewBox="0 0 32 32"
          className="h-5 w-5 text-slate-100"
        >
          <defs>
            <linearGradient id="logoAccent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
          <path
            d="M6 7h20a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"
            className="fill-slate-950/80"
          />
          <path
            d="M10 12h4.5M10 16h3M10 20h4.5"
            className="stroke-slate-300"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M16 10.5L22 9l-1.2 9.5c-.12.96-.73 1.79-1.6 2.14L14 23.5"
            fill="url(#logoAccent)"
            className="stroke-sky-300/80"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-[0.78rem] uppercase tracking-[0.18em] text-slate-500">Custody</span>
        <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Clarity
        </span>
      </div>
    </div>
  );
}
