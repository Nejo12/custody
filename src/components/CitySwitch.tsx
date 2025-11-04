"use client";
import { useAppStore } from "@/store/app";
import { useState, useEffect, useRef } from "react";

type City = "berlin" | "hamburg" | "nrw";

const CITIES: Array<{ code: City; label: string }> = [
  { code: "berlin", label: "Berlin" },
  { code: "hamburg", label: "Hamburg" },
  { code: "nrw", label: "NRW" },
];

export default function CitySwitch() {
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
        className="rounded-full border px-3 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-200 hover:text-black dark:hover:text-black"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        title="Preferred city"
      >
        {active?.label || "City"}
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
