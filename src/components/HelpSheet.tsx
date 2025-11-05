"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "@/store/app";
import { buildICS } from "@/lib/ics";
import { useI18n } from "@/i18n";
import { usePrefersReducedMotion } from "@/lib/hooks";

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

type QueueAggregate = {
  serviceId: string;
  avgWait: number;
  bestWindows: string[];
  count: number;
  lastSubmittedAt?: number;
};

export default function HelpSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const { preferredCity, setPreferredCity } = useAppStore();
  const [city, setCity] = useState<"berlin" | "hamburg" | "nrw">(preferredCity || "berlin");
  const [services, setServices] = useState<Service[]>([]);
  const [postcode, setPostcode] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");
  const isSettingFromLocation = useRef(false);
  const prefersReduced = usePrefersReducedMotion();
  const [queueIntel, setQueueIntel] = useState<Record<string, QueueAggregate>>({});
  const [reportFor, setReportFor] = useState<string>("");
  const [reportMinutes, setReportMinutes] = useState<string>("");
  const [reportWindow, setReportWindow] = useState<string>("");

  const filteredServices = useMemo(() => {
    const pc = postcode.trim();
    return services.filter((s) => (pc ? s.postcode.startsWith(pc) : true));
  }, [services, postcode]);

  useEffect(() => {
    if (!open) return;
    fetch(`/api/directory?city=${city}`)
      .then((r) => r.json())
      .then((d) => setServices(Array.isArray(d.services) ? (d.services as Service[]) : []))
      .catch(() => setServices([]));
  }, [open, city]);

  useEffect(() => {
    if (!open || services.length === 0) return;
    const ids = services.map((s) => s.id).join(",");
    fetch(`/api/queue?ids=${encodeURIComponent(ids)}`)
      .then((r) => r.json())
      .then((d: { aggregates?: QueueAggregate[] }) => {
        const map: Record<string, QueueAggregate> = {};
        (d.aggregates || []).forEach((a) => (map[a.serviceId] = a));
        setQueueIntel(map);
      })
      .catch(() => setQueueIntel({}));
  }, [open, services]);

  // Reset postcode when city changes (but not when setting from location detection)
  useEffect(() => {
    if (isSettingFromLocation.current) {
      isSettingFromLocation.current = false;
      return;
    }
    setPostcode("");
  }, [city]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="help-sheet-title"
          initial={{ opacity: prefersReduced ? 1 : 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: prefersReduced ? 1 : 0 }}
        >
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
            initial={{ opacity: prefersReduced ? 1 : 0 }}
            animate={{ opacity: 1, transition: { duration: prefersReduced ? 0 : 0.15 } }}
            exit={{
              opacity: prefersReduced ? 1 : 0,
              transition: { duration: prefersReduced ? 0 : 0.12 },
            }}
          />
          {/* Layout: bottom sheet on mobile, centered on desktop */}
          <div className="absolute inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              className="dialog-panel w-full sm:max-w-lg bg-white dark:bg-zinc-950 rounded-t-2xl sm:rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 p-4 space-y-3 max-h-[90vh] overflow-y-auto flex flex-col"
              initial={{ y: prefersReduced ? 0 : 56, opacity: prefersReduced ? 1 : 0 }}
              animate={{
                y: 0,
                opacity: 1,
                transition: prefersReduced
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 380, damping: 28 },
              }}
              exit={{
                y: prefersReduced ? 0 : 28,
                opacity: prefersReduced ? 1 : 0,
                transition: prefersReduced
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 320, damping: 30 },
              }}
            >
              {/* Drag handle for mobile */}
              <div className="md:hidden flex justify-center -mt-2 mb-1 flex-shrink-0">
                <div
                  className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full"
                  aria-hidden="true"
                />
              </div>
              <div className="flex items-center justify-between flex-shrink-0">
                <div id="help-sheet-title" className="font-medium text-zinc-900 dark:text-zinc-100">
                  {t.helpSheet.title}
                </div>
                <button
                  className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 text-zinc-700 dark:text-zinc-300"
                  onClick={onClose}
                  aria-label={t.helpSheet.closeButtonAriaLabel}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="text-sm text-zinc-700 dark:text-zinc-300 flex-shrink-0">
                {t.helpSheet.description}
              </div>
              <div className="rounded-lg border p-3 flex-shrink-0">
                <textarea
                  className="w-full rounded border p-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                  rows={4}
                  readOnly
                  onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                  value={t.helpSheet.scriptText}
                  aria-label={t.helpSheet.scriptAriaLabel}
                ></textarea>
                <div className="mt-2 flex gap-2">
                  <button
                    className="rounded border px-3 py-1 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    onClick={() => navigator.clipboard.writeText(t.helpSheet.scriptText)}
                    aria-label={t.helpSheet.copyButtonAriaLabel}
                  >
                    {t.helpSheet.copy}
                  </button>
                  <button
                    className="rounded border px-3 py-1 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    onClick={() => {
                      const ics = buildICS({
                        summary: t.helpSheet.callJugendamtCalendarSummary,
                        startISO: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                        durationMinutes: 15,
                      });
                      const blob = new Blob([ics], { type: "text/calendar" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "call-jugendamt.ics";
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    aria-label={t.helpSheet.addReminderAriaLabel}
                  >
                    {t.helpSheet.addReminder}
                  </button>
                </div>
              </div>
              <div className="rounded-lg border p-3 space-y-2 flex-1 min-h-0 overflow-hidden flex flex-col">
                <div className="text-xs uppercase text-zinc-600 dark:text-zinc-400">
                  {t.helpSheet.nearbyServices}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex gap-2 items-center flex-1">
                    <select
                      value={city}
                      onChange={(e) => {
                        const v = e.target.value as "berlin" | "hamburg" | "nrw";
                        setCity(v);
                        setPreferredCity(v);
                      }}
                      className="rounded border px-2 py-1 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="berlin">Berlin</option>
                      <option value="hamburg">Hamburg</option>
                      <option value="nrw">NRW</option>
                    </select>
                    <input
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                      placeholder={t.helpSheet.postcodePlaceholder}
                      className="flex-1 rounded border px-3 py-1 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400"
                    />
                    <button
                      type="button"
                      className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 rounded p-0.5"
                      title={t.helpSheet.privacyNote}
                      aria-label={t.helpSheet.privacyNoteAriaLabel}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        alert(t.helpSheet.privacyNote);
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <circle cx="12" cy="16" r="1" />
                      </svg>
                    </button>
                  </div>
                  <button
                    className="w-full sm:w-auto rounded border border-zinc-300 dark:border-zinc-700 px-2 py-1 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    onClick={() => {
                      setGeoError("");
                      setGeoLoading(true);
                      if (!("geolocation" in navigator)) {
                        setGeoError(t.helpSheet.locationUnavailable);
                        setGeoLoading(false);
                        return;
                      }
                      navigator.geolocation.getCurrentPosition(
                        async (pos) => {
                          try {
                            const { latitude, longitude } = pos.coords;
                            const res = await fetch(`/api/revgeo?lat=${latitude}&lon=${longitude}`);
                            const j = (await res.json()) as {
                              postcode?: string;
                              city?: "berlin" | "hamburg" | "nrw";
                              error?: string;
                            };
                            if (j.postcode) {
                              if (j.city) {
                                isSettingFromLocation.current = true;
                                setCity(j.city);
                                setPreferredCity(j.city);
                                // Set postcode in next tick to ensure city change effect has run
                                requestAnimationFrame(() => {
                                  setPostcode(j.postcode!);
                                });
                              } else {
                                setPostcode(j.postcode);
                              }
                            } else if (j.error) {
                              setGeoError(j.error);
                            }
                          } catch (err) {
                            console.error(err);
                            setGeoError(t.helpSheet.failedToDetect);
                          } finally {
                            setGeoLoading(false);
                          }
                        },
                        () => {
                          setGeoError(t.helpSheet.permissionDenied);
                          setGeoLoading(false);
                        }
                      );
                    }}
                  >
                    {t.helpSheet.useMyLocation}
                  </button>
                </div>
                {geoLoading && (
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    {t.helpSheet.detecting}
                  </div>
                )}
                {!!geoError && <div className="text-xs text-red-600">{geoError}</div>}
                <div className="space-y-2 flex-1 overflow-y-auto min-h-0">
                  {filteredServices.length === 0 && (
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">
                      {t.helpSheet.noServices}
                    </div>
                  )}
                  {filteredServices.slice(0, 6).map((s) => (
                    <div key={s.id} className="rounded border p-2">
                      <div className="text-xs uppercase text-zinc-600 dark:text-zinc-400">
                        {s.type}
                      </div>
                      <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                        {s.name}
                      </div>
                      <div className="text-sm text-zinc-700 dark:text-zinc-300">{s.address}</div>
                      {s.phone && (
                        <a
                          className="text-sm underline text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
                          href={`tel:${s.phone}`}
                          aria-label={t.helpSheet.callServiceAriaLabel.replace("{name}", s.name)}
                        >
                          {s.phone}
                        </a>
                      )}
                      {s.url && (
                        <a
                          className="ml-2 text-sm underline text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={t.helpSheet.visitWebsiteAriaLabel.replace("{name}", s.name)}
                        >
                          {t.helpSheet.website}
                        </a>
                      )}
                      {s.opening && (
                        <div className="text-xs text-zinc-600 dark:text-zinc-400">{s.opening}</div>
                      )}
                      {queueIntel[s.id] && (
                        <div className="mt-1 text-[11px] text-zinc-600 dark:text-zinc-400">
                          {t.helpSheet.queueBest}: {queueIntel[s.id].bestWindows.join(" / ") || "—"}{" "}
                          · {t.helpSheet.queueAvg} {queueIntel[s.id].avgWait}m
                          <button
                            className="ml-2 underline"
                            onClick={() => {
                              setReportFor(s.id);
                              setReportMinutes("");
                              setReportWindow("");
                            }}
                          >
                            {t.helpSheet.queueReport}
                          </button>
                        </div>
                      )}
                      {queueIntel[s.id]?.lastSubmittedAt && (
                        <div
                          className="text-[11px] text-zinc-500 dark:text-zinc-500 mt-0.5"
                          suppressHydrationWarning
                        >
                          {t.helpSheet.queueLastVerified}:{" "}
                          {new Date(queueIntel[s.id].lastSubmittedAt || 0)
                            .toISOString()
                            .slice(0, 10)}
                        </div>
                      )}
                      {reportFor === s.id && (
                        <form
                          className="mt-2 flex items-center gap-2 text-[11px]"
                          onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                              const payload = {
                                serviceId: s.id,
                                waitMinutes: Number(reportMinutes),
                                suggestedWindow: reportWindow,
                              };
                              const res = await fetch("/api/queue", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(payload),
                              });
                              if (res.ok) {
                                setReportFor("");
                                const ids = services.map((x) => x.id).join(",");
                                const r = await fetch(`/api/queue?ids=${encodeURIComponent(ids)}`);
                                const j = (await r.json()) as { aggregates?: QueueAggregate[] };
                                const map: Record<string, QueueAggregate> = {};
                                (j.aggregates || []).forEach((a) => (map[a.serviceId] = a));
                                setQueueIntel(map);
                              }
                            } catch {
                              // ignore
                            }
                          }}
                        >
                          <input
                            required
                            min={1}
                            max={600}
                            value={reportMinutes}
                            onChange={(e) => setReportMinutes(e.target.value)}
                            placeholder={t.helpSheet.queueMins}
                            className="w-16 rounded border px-2 py-1"
                            type="number"
                          />
                          <input
                            value={reportWindow}
                            onChange={(e) => setReportWindow(e.target.value)}
                            placeholder={t.helpSheet.queueBestWindowPlaceholder}
                            className="flex-1 rounded border px-2 py-1"
                          />
                          <button className="rounded border px-2 py-1">
                            {t.helpSheet.queueSend}
                          </button>
                          <button
                            type="button"
                            className="underline"
                            onClick={() => setReportFor("")}
                          >
                            {t.helpSheet.queueCancel}
                          </button>
                        </form>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400 flex-shrink-0">
                {t.helpSheet.disclaimer}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
