"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import explainers from "@/data/explainers.json";

type Explainer = {
  slug: string;
  title: string;
  url: string;
  snapshotId: string;
  lastVerified: string;
};

function ExplainerInner() {
  const params = useSearchParams();
  const slug = params.get("slug") || "";
  const items = explainers as Explainer[];
  const item = items.find((e) => e.slug === slug);
  if (!item) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-3">
        <p>Not found.</p>
        <Link href="/learn" className="underline">
          Back to Learn
        </Link>
      </div>
    );
  }
  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-3">
      <Link href="/learn" className="text-sm underline">
        ← Back
      </Link>
      <h1 className="text-xl font-semibold">{item.title}</h1>
      <div className="text-sm text-zinc-700">
        Last verified: {item.lastVerified} · Snapshot: {item.snapshotId}
      </div>
      <a href={item.url} target="_blank" className="underline">
        Source
      </a>
    </div>
  );
}

export default function ExplainerItemPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-xl mx-auto px-4 py-6">Loading…</div>}>
      <ExplainerInner />
    </Suspense>
  );
}
