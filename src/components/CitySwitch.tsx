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
          "inline-flex items-center justify-center px-4 h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
        }
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Change region. Current: ${active?.label || "City"}`}
        onClick={() => setOpen((v) => !v)}
        title={active ? `Region: ${active.label}` : "Change region"}
      >
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-500">
          {active?.label || "City"}
        </span>
      </button>
      {open && (
        <ul
          role="listbox"
          className="menu-panel absolute right-0 mt-1 w-40 rounded-lg border bg-white dark:bg-zinc-900 shadow-xl z-50 overflow-hidden divide-y divide-zinc-200 dark:divide-zinc-800"
        >
          {CITIES.map((c) => {
            const handleSelect = () => {
              setPreferredCity(c.code);
              setOpen(false);
            };
            return (
              <li
                key={c.code}
                role="option"
                aria-selected={preferredCity === c.code}
                className={preferredCity === c.code ? "bg-zinc-50 dark:bg-zinc-800" : ""}
                onClick={handleSelect}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect();
                  }}
                  className={`w-full text-left px-3 py-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 ${preferredCity === c.code ? "font-medium" : ""}`}
                  aria-label={`Select ${c.label}`}
                >
                  {c.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
