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
      <ul className="space-y-2">
        {items.map((e) => (
          <li
            key={e.slug}
            className="rounded-lg border p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <Link href={`/learn/item?slug=${e.slug}`} className="font-medium underline">
              {e.title}
            </Link>
            <div className="text-xs text-zinc-500 mt-1">
              Last verified: {e.lastVerified} · Snapshot: {e.snapshotId}
            </div>
          </li>
        ))}
      </ul>
      <div className="pt-2">
        <h2 className="font-medium mb-2">Find support by city</h2>
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
                <div className="text-sm uppercase text-zinc-500">{grp.label}</div>
                <div className="grid grid-cols-1 gap-2 mt-1">
                  {items.map((s: Service) => (
                    <div key={s.id}>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">{s.address}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-2">
                  <Link
                    href={`/directory?city=${grp.city}`}
                    className="text-sm underline inline-block"
                  >
                    All services
                  </Link>
                  <Link
                    href={`/directory?city=${grp.city}&type=jugendamt`}
                    className="text-sm underline inline-block"
                  >
                    Jugendämter
                  </Link>
                  <Link
                    href={`/directory?city=${grp.city}&type=court`}
                    className="text-sm underline inline-block"
                  >
                    Courts
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
