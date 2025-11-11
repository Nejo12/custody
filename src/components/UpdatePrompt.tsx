"use client";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { useServiceWorkerUpdate } from "./useServiceWorkerUpdate";

export default function UpdatePrompt() {
  const { t } = useI18n();
  const { hasUpdate, isUpdating, updateServiceWorker, skipUpdate } = useServiceWorkerUpdate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (hasUpdate) {
      setTimeout(() => {
        setVisible(true);
      }, 0);
    }
  }, [hasUpdate]);

  const handleUpdate = async () => {
    await updateServiceWorker();
    setVisible(false);
  };

  const handleLater = () => {
    skipUpdate();
    setVisible(false);
  };

  if (!visible || !hasUpdate) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 flex items-center justify-between text-sm text-zinc-900 dark:text-zinc-100 shadow-lg">
      <span>{t.updatePrompt?.message || "A new version is available."}</span>
      <div className="flex items-center gap-2 ml-4">
        <button
          className="rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1 text-sm text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-700"
          onClick={handleLater}
          disabled={isUpdating}
        >
          {t.updatePrompt?.later || "Later"}
        </button>
        <button
          className="rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-900 dark:bg-zinc-100 px-3 py-1 text-sm text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
          onClick={handleUpdate}
          disabled={isUpdating}
        >
          {isUpdating
            ? t.updatePrompt?.updating || "Updating..."
            : t.updatePrompt?.updateNow || "Update now"}
        </button>
      </div>
    </div>
  );
}
