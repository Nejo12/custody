"use client";
import { useI18n } from "@/i18n";
import { useAppStore } from "@/store/app";

const languages: {
  code: "en" | "de" | "ar" | "pl" | "fr" | "tr" | "ru";
  label: string;
  name: string;
}[] = [
  { code: "en", label: "EN", name: "English" },
  { code: "de", label: "DE", name: "Deutsch" },
  { code: "ar", label: "AR", name: "العربية" },
  { code: "pl", label: "PL", name: "Polski" },
  { code: "fr", label: "FR", name: "Français" },
  { code: "tr", label: "TR", name: "Türkçe" },
  { code: "ru", label: "RU", name: "Русский" },
];

export default function SettingsPage() {
  const { t, locale, setLocale } = useI18n();
  const {
    socialWorkerMode,
    setSocialWorkerMode,
    safetyMode,
    setSafetyMode,
    discreetMode,
    setDiscreetMode,
    blurThumbnails,
    setBlurThumbnails,
  } = useAppStore();
  async function quickWipe() {
    const ok = confirm(
      t.settings?.quickWipeConfirm || "Erase local data and cached files? This cannot be undone."
    );
    if (!ok) return;
    try {
      // Reset app state
      (await import("@/store/app")).useAppStore.getState().wipeAll();
      // Clear caches
      if (typeof caches !== "undefined") {
        const names = await caches.keys();
        await Promise.all(names.map((n) => caches.delete(n)));
      }
      // Unregister service workers
      if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        await reg?.unregister();
      }
    } finally {
      // Reload to a clean state
      if (typeof window !== "undefined") window.location.href = "/";
    }
  }
  async function clearOcrCache() {
    try {
      if (typeof caches !== "undefined") {
        const names = await caches.keys();
        await Promise.all(
          names.map(async (n) => {
            const c = await caches.open(n);
            const reqs = await c.keys();
            await Promise.all(
              reqs.map((r) => {
                const u = r.url;
                if (/tesseract|traineddata/i.test(u)) return c.delete(r);
                return Promise.resolve(false);
              })
            );
          })
        );
        alert(t.settings?.ocrCacheCleared || "OCR cache cleared.");
      }
    } catch {
      // ignore
    }
  }
  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-xl font-semibold">{t.settings?.title || "Settings"}</h1>

      <div className="space-y-2">
        <div className="text-sm text-zinc-700 dark:text-zinc-400">
          {t.settings?.language || "Language"}
        </div>
        <div className="inline-flex flex-wrap gap-2 rounded-full border overflow-hidden">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLocale(lang.code)}
              className={`px-4 py-2 ${locale === lang.code ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-700" : "bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400"}`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-sm text-zinc-700 dark:text-zinc-400">
          {t.settings?.about || "About"}
        </div>
        <p className="text-sm text-zinc-700">
          {t.settings?.aboutDescription ||
            "Privacy-first, offline-capable prototype. Information only, not individualized legal advice."}
        </p>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-zinc-700 dark:text-zinc-400">
          {t.settings?.socialWorkerMode || "Social Worker Mode"}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={socialWorkerMode}
            onChange={(e) => setSocialWorkerMode(e.target.checked)}
          />
          {t.settings?.socialWorkerModeEnable || "Enable tools for helpers/NGOs"}
        </label>
        {socialWorkerMode && (
          <a href="/worker" className="underline text-sm">
            {t.settings?.socialWorkerModeOpen || "Open Social Worker tools"}
          </a>
        )}
      </div>

      <div className="space-y-2">
        <div className="text-sm text-zinc-700 dark:text-zinc-400">
          {t.settings?.safety || "Safety"}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={safetyMode}
            onChange={(e) => setSafetyMode(e.target.checked)}
          />
          {t.settings?.safetyMode || "Safety Mode (enable quick-exit shortcut)"}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={discreetMode}
            onChange={(e) => setDiscreetMode(e.target.checked)}
          />
          {t.settings?.discreetMode || "Discreet app name in header"}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={blurThumbnails}
            onChange={(e) => setBlurThumbnails(e.target.checked)}
          />
          {t.settings?.blurThumbnails || "Blur thumbnails/previews"}
        </label>
        <button
          onClick={quickWipe}
          className="rounded-md border px-3 py-1 text-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40"
        >
          {t.settings?.quickWipe || "Quick Wipe (panic erase)"}
        </button>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          {t.settings?.quickWipeNote ||
            "Removes local data, clears caches, and unregisters the service worker."}
        </div>
        <button onClick={clearOcrCache} className="rounded-md border px-3 py-1 text-sm">
          {t.settings?.clearOcrCache || "Clear OCR model cache"}
        </button>
      </div>
    </div>
  );
}
