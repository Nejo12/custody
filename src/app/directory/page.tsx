"use client";
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/app";

type Service = {
  id: string;
  type: string;
  name: string;
  postcode: string;
  address: string;
  phone: string;
  url: string;
  opening?: string;
};
type City = "berlin" | "hamburg" | "nrw";

export default function DirectoryPage() {
  const { t } = useI18n();
  const { preferredCity, setPreferredCity } = useAppStore();
  const [services, setServices] = useState<Service[]>([]);
  const [snapshots, setSnapshots] = useState<Record<City, Service[]>>({
    berlin: [],
    hamburg: [],
    nrw: [],
  });
  const [q, setQ] = useState("");
  const [type, setType] = useState<string>("");
  const [city, setCity] = useState<City>(preferredCity || "berlin");

  // Optional deep link: /directory?city=hamburg|nrw&type=court|jugendamt|...
  useEffect(() => {
    if (typeof window === "undefined") return;
    const u = new URL(window.location.href);
    const c = u.searchParams.get("city") as City | null;
    const ty = u.searchParams.get("type");
    if (c && c !== city) {
      setCity(c);
      setPreferredCity(c);
    }
    if (ty && ty !== type) setType(ty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch snapshot previews for all cities (Jugendamt/Court samples)
  useEffect(() => {
    let cancelled = false;
    const cities: City[] = ["berlin", "hamburg", "nrw"];
    Promise.all(
      cities.map(async (c) => {
        const r = await fetch(`/api/directory?city=${c}`);
        const j = (await r.json()) as { services?: Service[] };
        return [c, Array.isArray(j.services) ? j.services : []] as const;
      })
    )
      .then((entries) => {
        if (cancelled) return;
        const obj: Record<City, Service[]> = { berlin: [], hamburg: [], nrw: [] };
        for (const [c, arr] of entries) obj[c] = arr;
        setSnapshots(obj);
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    fetch(`/api/directory?city=${city}` + (type ? `&type=${type}` : ""))
      .then((r) => r.json())
      .then((d) => setServices(d.services || []));
  }, [type, city]);

  const filtered = useMemo(() => {
    const trimmed = q.trim();
    return services.filter((s) => (trimmed ? s.postcode.startsWith(trimmed) : true));
  }, [services, q]);

  return (
    <div className="w-full max-w-xl mx-auto min-h-[calc(100vh-8rem)] flex flex-col">
      {/* Fixed Header Section */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 px-4 pt-6 pb-4 shadow-sm">
        <h1 className="text-xl font-semibold mb-4">{t.directory.title}</h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
          <select
            value={city}
            onChange={(e) => {
              const v = e.target.value as City;
              setCity(v);
              setPreferredCity(v);
            }}
            className="w-full sm:w-auto sm:min-w-[120px] rounded border px-3 py-2 text-sm sm:text-base bg-background dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
          >
            <option value="berlin">Berlin</option>
            <option value="hamburg">Hamburg</option>
            <option value="nrw">NRW</option>
          </select>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex-1 w-full min-w-0 rounded border px-3 py-2 text-sm sm:text-base bg-background dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
            placeholder={t.directory.searchPlaceholder}
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full sm:w-auto sm:min-w-[140px] rounded border px-3 py-2 text-sm sm:text-base bg-background dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
          >
            <option value="">{t.directory.typeFilter}</option>
            <option value="jugendamt">{t.directory.jugendamt}</option>
            <option value="court">{t.directory.court}</option>
            <option value="mediation">{t.directory.mediation}</option>
            <option value="legal_aid">{t.directory.legal_aid}</option>
            <option value="counseling">{t.directory.counseling}</option>
            <option value="support_group">{t.directory.support_group}</option>
          </select>
        </div>
      </div>

      {/* Scrollable Cards Section */}
      <div
        className="flex-1 overflow-y-auto px-4 pb-6 scroll-smooth"
        style={{ scrollBehavior: "smooth" }}
      >
        <div className="space-y-3 pt-4">
          <details className="rounded-lg border p-3">
            <summary className="font-medium cursor-pointer">City snapshots</summary>
            <div className="mt-2 grid grid-cols-1 gap-3">
              {[
                { label: "Berlin", key: "berlin" as City, data: snapshots.berlin },
                { label: "Hamburg", key: "hamburg" as City, data: snapshots.hamburg },
                { label: "NRW", key: "nrw" as City, data: snapshots.nrw },
              ].map((grp) => {
                const items: Service[] = grp.data
                  .filter((s) => s.type === "jugendamt" || s.type === "court")
                  .slice(0, 2);
                return (
                  <div key={grp.key} className="rounded border p-3">
                    <div className="text-sm uppercase text-zinc-500 mb-1">{grp.label}</div>
                    {items.map((s: Service) => (
                      <div key={s.id} className="mb-2">
                        <div className="font-medium">{s.name}</div>
                        <div className="text-sm text-zinc-600 dark:text-zinc-400">{s.address}</div>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        setCity(grp.key as City);
                        setPreferredCity(grp.key as City);
                      }}
                      className="text-sm underline"
                    >
                      View all in {grp.label}
                    </button>
                  </div>
                );
              })}
            </div>
          </details>
          <AnimatePresence mode="wait">
            {filtered.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-sm text-zinc-500"
              >
                {t.directory.noResults}
              </motion.div>
            )}
            {filtered.map((s, index) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{
                  duration: 0.4,
                  delay: Math.min(index * 0.05, 0.3),
                  ease: [0.4, 0, 0.2, 1],
                }}
                className="rounded-lg border p-4 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition-all duration-200"
              >
                <div className="text-sm uppercase tracking-wide text-zinc-500">{s.type}</div>
                <div className="font-medium">{s.name}</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">{s.address}</div>
                <div className="text-sm">{s.phone}</div>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                >
                  {s.url}
                </a>
                {s.opening && <div className="text-xs text-zinc-500 mt-1">{s.opening}</div>}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
