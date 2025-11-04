"use client";
import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/store/app";
import { buildICS } from "@/lib/ics";

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

export default function HelpSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { preferredCity, setPreferredCity } = useAppStore();
  const [city, setCity] = useState<"berlin" | "hamburg" | "nrw">(preferredCity || "berlin");
  const [services, setServices] = useState<Service[]>([]);
  const [postcode, setPostcode] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");

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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-sheet-title"
    >
      <div className="w-full sm:max-w-lg bg-white dark:bg-zinc-950 rounded-t-2xl sm:rounded-2xl p-4 space-y-3 max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between flex-shrink-0">
          <div id="help-sheet-title" className="font-medium">
            Find Help Now
          </div>
          <button
            className="text-sm underline hover:no-underline"
            onClick={onClose}
            aria-label="Close help dialog"
          >
            Close
          </button>
        </div>
        <div className="text-sm text-zinc-700 dark:text-zinc-300 flex-shrink-0">
          Call your nearest Jugendamt or court registry. Use the script below; tap to copy. You can
          also add a calendar reminder.
        </div>
        <div className="rounded-lg border p-3 flex-shrink-0">
          <div className="text-xs uppercase text-zinc-500 mb-1">What to say (German)</div>
          <textarea
            className="w-full rounded border p-2 text-sm"
            rows={4}
            readOnly
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            value="Guten Tag, ich benötige Informationen zu Sorgerecht/Umgang. Ich möchte wissen, welche Unterlagen ich mitbringen muss und wie ich einen Termin bekomme. Vielen Dank!"
            aria-label="German script text"
          ></textarea>
          <div className="mt-2 flex gap-2">
            <button
              className="rounded border px-3 py-1 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
              onClick={() =>
                navigator.clipboard.writeText(
                  "Guten Tag, ich benötige Informationen zu Sorgerecht/Umgang. Ich möchte wissen, welche Unterlagen ich mitbringen muss und wie ich einen Termin bekomme. Vielen Dank!"
                )
              }
              aria-label="Copy script to clipboard"
            >
              Copy
            </button>
            <button
              className="rounded border px-3 py-1 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
              onClick={() => {
                const ics = buildICS({
                  summary: "Call Jugendamt",
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
              aria-label="Add calendar reminder"
            >
              Add reminder
            </button>
          </div>
        </div>
        <div className="rounded-lg border p-3 space-y-2 flex-1 min-h-0 overflow-hidden flex flex-col">
          <div className="text-xs uppercase text-zinc-500">Nearby services</div>
          <div className="flex gap-2 items-center">
            <select
              value={city}
              onChange={(e) => {
                const v = e.target.value as "berlin" | "hamburg" | "nrw";
                setCity(v);
                setPreferredCity(v);
              }}
              className="rounded border px-2 py-1 text-sm"
            >
              <option value="berlin">Berlin</option>
              <option value="hamburg">Hamburg</option>
              <option value="nrw">NRW</option>
            </select>
            <input
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="Postcode (e.g. 10115)"
              className="flex-1 rounded border px-3 py-1 text-sm"
            />
            <button
              className="rounded border px-2 py-1 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-200 hover:text-black dark:hover:text-black"
              onClick={() => {
                setGeoError("");
                setGeoLoading(true);
                if (!("geolocation" in navigator)) {
                  setGeoError("Location unavailable");
                  setGeoLoading(false);
                  return;
                }
                navigator.geolocation.getCurrentPosition(
                  async (pos) => {
                    try {
                      const { latitude, longitude } = pos.coords;
                      const res = await fetch(`/api/revgeo?lat=${latitude}&lon=${longitude}`);
                      const j = (await res.json()) as { postcode?: string; error?: string };
                      if (j.postcode) setPostcode(j.postcode);
                      else if (j.error) setGeoError(j.error);
                    } catch (err) {
                      console.error(err);
                      setGeoError("Failed to detect postcode");
                    } finally {
                      setGeoLoading(false);
                    }
                  },
                  () => {
                    setGeoError("Permission denied");
                    setGeoLoading(false);
                  }
                );
              }}
            >
              Use my location
            </button>
            <span
              title="We only use your location to find your postcode. No location data is stored or sent elsewhere."
              className="text-zinc-500"
              aria-label="Privacy note"
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
            </span>
          </div>
          {geoLoading && <div className="text-xs text-zinc-500">Detecting…</div>}
          {!!geoError && <div className="text-xs text-red-600">{geoError}</div>}
          <div className="space-y-2 flex-1 overflow-y-auto min-h-0">
            {filteredServices.length === 0 && (
              <div className="text-sm text-zinc-500">No services yet. Try a postcode.</div>
            )}
            {filteredServices.slice(0, 6).map((s) => (
              <div key={s.id} className="rounded border p-2">
                <div className="text-xs uppercase text-zinc-500">{s.type}</div>
                <div className="font-medium text-sm">{s.name}</div>
                <div className="text-sm text-zinc-600">{s.address}</div>
                {s.phone && (
                  <a
                    className="text-sm underline"
                    href={`tel:${s.phone}`}
                    aria-label={`Call ${s.name}`}
                  >
                    {s.phone}
                  </a>
                )}
                {s.url && (
                  <a
                    className="ml-2 text-sm underline"
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit ${s.name} website`}
                  >
                    Website
                  </a>
                )}
                {s.opening && <div className="text-xs text-zinc-500">{s.opening}</div>}
              </div>
            ))}
          </div>
        </div>
        <div className="text-xs text-zinc-500 flex-shrink-0">
          Information only — not individualized legal advice.
        </div>
      </div>
    </div>
  );
}
