"use client";
import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
};

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: Event) => {
      e.preventDefault();
      const bip = e as BeforeInstallPromptEvent;
      setDeferred(bip);
      setVisible(true);
    };
    const manual = () => {
      if (deferred) {
        deferred.prompt();
      }
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('installapp', manual as EventListener);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('installapp', manual as EventListener);
    };
  }, [deferred]);

  if (!visible || !deferred) return null;

  return (
    <div className="mt-4 rounded-lg border p-3 flex items-center justify-between text-sm">
      <span>Install this app for quicker access.</span>
      <button
        className="rounded border px-3 py-1 hover:bg-zinc-50"
        onClick={async () => {
          try {
            await deferred.prompt();
          } finally {
            setVisible(false);
            setDeferred(null);
          }
        }}
      >
        Install
      </button>
    </div>
  );
}
