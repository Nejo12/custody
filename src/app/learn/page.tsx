"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import explainers from "@/data/explainers.json";

type Explainer = {
  slug: string;
  title: string;
  url: string;
  snapshotId: string;
  lastVerified: string;
};

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

export default function LearnPage() {
  const { t } = useI18n();
  const items = explainers as Explainer[];
  const [snapshots, setSnapshots] = useState<Record<City, Service[]>>({
    berlin: [],
    hamburg: [],
    nrw: [],
  });

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
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-semibold">{t.home.learn}</h1>

      {/* Navigation to other learning resources */}
      <div className="flex gap-3 flex-wrap">
        <Link
          href="/guides"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          {t.learn.legalGuides}
        </Link>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          {t.learn.blog}
        </Link>
      </div>

      <h2 className="text-lg font-medium pt-2">{t.learn.officialResources}</h2>
      <ul className="space-y-2">
        {items.map((e) => (
          <li
            key={e.slug}
            className="rounded-lg border p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <Link href={`/learn/item?slug=${e.slug}`} className="font-medium underline">
              {e.title}
            </Link>
            <div className="text-xs text-zinc-700 dark:text-zinc-400 mt-1">
              {t.result.lastVerified || "Last verified:"} {e.lastVerified} ·{" "}
              {t.result.snapshot || "Snapshot:"} {e.snapshotId}
            </div>
          </li>
        ))}
      </ul>
      <div className="pt-2">
        <h2 className="font-medium mb-2">{t.learn?.findSupportByCity || "Find support by city"}</h2>
        <div className="space-y-3">
          {[
            { label: "Berlin", city: "berlin" as City, data: snapshots.berlin },
            { label: "Hamburg", city: "hamburg" as City, data: snapshots.hamburg },
            { label: "NRW", city: "nrw" as City, data: snapshots.nrw },
          ].map((grp) => {
            const items: Service[] = grp.data
              .filter((s) => s.type === "jugendamt" || s.type === "court")
              .slice(0, 2);
            return (
              <div key={grp.city} className="rounded-lg border p-3">
                <div className="text-sm uppercase text-zinc-700 dark:text-zinc-400">
                  {grp.label}
                </div>
                <div className="grid grid-cols-1 gap-2 mt-1">
                  {items.map((s: Service) => (
                    <div key={s.id}>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-sm text-zinc-700 dark:text-zinc-300">{s.address}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-2">
                  <Link
                    href={`/directory?city=${grp.city}`}
                    className="text-sm underline inline-block"
                  >
                    {t.learn?.allServices || "All services"}
                  </Link>
                  <Link
                    href={`/directory?city=${grp.city}&type=jugendamt`}
                    className="text-sm underline inline-block"
                  >
                    {t.learn?.jugendamter || "Jugendämter"}
                  </Link>
                  <Link
                    href={`/directory?city=${grp.city}&type=court`}
                    className="text-sm underline inline-block"
                  >
                    {t.learn?.courts || "Courts"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
