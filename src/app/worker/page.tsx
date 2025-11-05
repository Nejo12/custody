"use client";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store/app";
import { buildPackZip } from "@/lib/packs";

export default function WorkerPage() {
  const { socialWorkerMode, locale } = useAppStore();
  const [names, setNames] = useState<string>("");
  const [kinds, setKinds] = useState<{ joint: boolean; contact: boolean }>({
    joint: true,
    contact: false,
  });
  const [downloading, setDownloading] = useState(false);
  const senderLabel = "Sender name per line (used as cover-letter sender)";

  useEffect(() => {
    if (!socialWorkerMode && typeof window !== "undefined") {
      window.location.href = "/settings";
    }
  }, [socialWorkerMode]);

  async function onBuild() {
    try {
      setDownloading(true);
      const list = names
        .split(/\n+/)
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, 20);
      if (list.length === 0) return;
      const JSZip = (await import("jszip")).default;
      const master = new JSZip();
      for (const n of list) {
        if (kinds.joint) {
          const blob = await buildPackZip("joint", locale, { fullName: n });
          const buf = await blob.arrayBuffer();
          master.file(`pack-joint-${n.replace(/[^a-z0-9_-]+/gi, "_")}.zip`, buf);
        }
        if (kinds.contact) {
          const blob = await buildPackZip("contact", locale, { fullName: n });
          const buf = await blob.arrayBuffer();
          master.file(`pack-contact-${n.replace(/[^a-z0-9_-]+/gi, "_")}.zip`, buf);
        }
      }
      const out = await master.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(out);
      const a = document.createElement("a");
      a.href = url;
      a.download = `batch-packs-${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-semibold">Social Worker Tools</h1>
      <div className="rounded-lg border p-3 space-y-2 no-print">
        <div className="text-sm font-medium">Batch Action Packs</div>
        <div className="text-xs">{senderLabel}</div>
        <textarea
          className="w-full rounded border p-2 text-sm min-h-[120px]"
          value={names}
          onChange={(e) => setNames(e.target.value)}
          placeholder={"Jane Doe\nJohn Smith"}
        />
        <div className="flex items-center gap-3 text-sm">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={kinds.joint}
              onChange={(e) => setKinds((k) => ({ ...k, joint: e.target.checked }))}
            />
            Joint Custody Pack
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={kinds.contact}
              onChange={(e) => setKinds((k) => ({ ...k, contact: e.target.checked }))}
            />
            Contact Order Pack
          </label>
        </div>
        <button
          className="rounded border px-3 py-1 text-sm"
          onClick={onBuild}
          disabled={downloading}
        >
          {downloading ? "Building…" : "Build batch ZIP"}
        </button>
        <div className="text-xs text-zinc-600">
          Redaction is applied in cover‑letters via sender only; full case redaction export
          available in Vault.
        </div>
      </div>
      <div className="rounded-lg border p-3 space-y-2 no-print">
        <div className="text-sm font-medium">Hand to Parent (QR link)</div>
        <QRPreview url="/result" />
        <div className="text-xs text-zinc-600">
          Opens the Result page on this device. For case‑specific links, we can add generated
          view‑only routes later.
        </div>
      </div>

      <div className="rounded-lg border p-3 space-y-2 no-print">
        <div className="text-sm font-medium">Redacted CSV Export</div>
        <button
          className="rounded border px-3 py-1 text-sm"
          onClick={() => {
            const list = names
              .split(/\n+/)
              .map((l) => l.trim())
              .filter(Boolean);
            const rows = ["case_id,pack_types"];
            list.forEach((_, idx) => {
              const id = `case_${idx + 1}`;
              const types = [kinds.joint ? "joint" : null, kinds.contact ? "contact" : null]
                .filter(Boolean)
                .join("+");
              rows.push(`${id},${types}`);
            });
            const blob = new Blob([rows.join("\n")], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `redacted-cases-${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Export redacted CSV
        </button>
      </div>
    </div>
  );
}

function QRPreview({ url }: { url: string }) {
  const [src, setSrc] = useState<string>("");
  useEffect(() => {
    (async () => {
      const QR = await import("qrcode");
      const dataUrl = await QR.toDataURL(url, { margin: 1, width: 200 });
      setSrc(dataUrl);
    })();
  }, [url]);
  if (!src) return null;
  return (
    <div className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="QR" className="w-28 h-28" />
      <div className="text-xs break-all">{window?.location?.origin + url}</div>
    </div>
  );
}
