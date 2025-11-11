"use client";
import { useEffect, useState } from "react";
import { useInstallPrompt } from "./useInstallPrompt";

export default function InstallPrompt() {
  const { canInstall, promptInstall } = useInstallPrompt();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!canInstall) {
      setTimeout(() => {
        setVisible(false);
      }, 100);
    }
  }, [canInstall]);

  useEffect(() => {
    if (canInstall) {
      setTimeout(() => {
        promptInstall();
      }, 100);
    }
  }, [promptInstall, canInstall]);

  if (!visible || !canInstall) return null;

  return (
    <div className="mt-4 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
      <span>Install this app for quicker access.</span>
      <button
        className="rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1 text-sm text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700"
        onClick={async () => {
          await promptInstall();
          setVisible(false);
        }}
      >
        Install
      </button>
    </div>
  );
}
