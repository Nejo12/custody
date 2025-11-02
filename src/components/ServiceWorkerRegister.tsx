"use client";
import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const register = async () => {
        try {
          await navigator.serviceWorker.register('/sw.js');
        } catch (err) {
          console.warn('SW registration failed', err);
        }
      };
      register();
    }
  }, []);
  return null;
}

