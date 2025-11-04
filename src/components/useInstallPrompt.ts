"use client";
import { useEffect, useMemo, useRef, useState } from "react";

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
};

function isMobileUA(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  // iOS Safari property is not typed in TS lib
  const iosStandalone =
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  const mm = window.matchMedia && window.matchMedia("(display-mode: standalone)").matches;
  return !!iosStandalone || !!mm;
}

export function useInstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const eventRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      const bip = e as BeforeInstallPromptEvent;
      eventRef.current = bip;
      setEvent(bip);
    };
    const onInstalled = () => {
      setInstalled(true);
      eventRef.current = null;
      setEvent(null);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const mobile = isMobileUA();
  const standalone = isStandalone();

  const canInstall = useMemo(
    () => !!event && mobile && !standalone && !installed,
    [event, mobile, standalone, installed]
  );

  const promptInstall = async () => {
    if (eventRef.current) {
      await eventRef.current.prompt();
    }
  };

  return { canInstall, promptInstall };
}
