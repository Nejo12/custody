"use client";
import { useEffect } from "react";
import { useAppStore } from "@/store/app";

export default function ThemeInit() {
  const { updateResolvedTheme } = useAppStore();

  useEffect(() => {
    updateResolvedTheme();
  }, [updateResolvedTheme]);

  return null;
}
