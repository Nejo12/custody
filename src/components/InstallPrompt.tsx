"use client";
import { useEffect, useState } from 'react';
import { useInstallPrompt } from './useInstallPrompt';

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
    <div className="mt-4 rounded-lg border p-3 flex items-center justify-between text-sm">
      <span>Install this app for quicker access.</span>
      <button
        className="rounded border px-3 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-200 hover:text-black dark:hover:text-black"
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
