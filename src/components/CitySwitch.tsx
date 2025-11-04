"use client";
import { useAppStore } from "@/store/app";
import { useState, useEffect, useRef } from "react";

type City = "berlin" | "hamburg" | "nrw";

const CITIES: Array<{ code: City; label: string }> = [
  { code: "berlin", label: "Berlin" },
  { code: "hamburg", label: "Hamburg" },
  { code: "nrw", label: "NRW" },
];

export default function CitySwitch({ buttonClassName }: { buttonClassName?: string }) {
  const { preferredCity, setPreferredCity } = useAppStore();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const active = CITIES.find((c) => c.code === preferredCity);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={containerRef} className="relative text-sm">
      <button
        className={
          buttonClassName ||
          "inline-flex items-center justify-center w-10 h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
        }
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Change region. Current: ${active?.label || "City"}`}
        onClick={() => setOpen((v) => !v)}
        title={active ? `Region: ${active.label}` : "Change region"}
      >
        <svg
          className="w-4 h-4 text-zinc-700 dark:text-zinc-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 mt-1 w-40 rounded-lg border bg-white shadow-md dark:bg-zinc-900 dark:border-zinc-700 z-50"
        >
          {CITIES.map((c) => (
            <li key={c.code} role="option" aria-selected={preferredCity === c.code}>
              <button
                onClick={() => {
                  setPreferredCity(c.code);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 ${preferredCity === c.code ? "font-medium" : ""}`}
                aria-label={`Select ${c.label}`}
              >
                {c.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
