"use client";

import { useEffect } from "react";

type TrackPayload = {
  code?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  partner?: string;
  landingPath: string;
  referrer?: string;
  visitorId: string;
};

/**
 * ReferralTracker reads UTM/ref parameters on first load and sends
 * a single tracking event to the backend. It uses sessionStorage
 * to avoid duplicate submissions on the same page session, and
 * localStorage to keep a long‑lived anonymous visitor id.
 */
export default function ReferralTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Ensure we only record once per session for the same URL
    const sessionKey = `reftrack:${window.location.href}`;
    if (sessionStorage.getItem(sessionKey)) return;

    const url = new URL(window.location.href);
    const params = url.searchParams;

    // Pick up common source parameters
    const code = params.get("ref") || params.get("referral") || params.get("code") || undefined;
    const partner = params.get("partner") || undefined;
    const source = params.get("utm_source") || undefined;
    const medium = params.get("utm_medium") || undefined;
    const campaign = params.get("utm_campaign") || undefined;
    const content = params.get("utm_content") || undefined;
    const term = params.get("utm_term") || undefined;

    // If nothing referral‑ish is present, skip
    if (!code && !partner && !source && !campaign) return;

    // Long‑lived anonymous visitor id
    let visitorId = localStorage.getItem("visitorId") || "";
    if (!visitorId) {
      // crypto is available in modern browsers
      visitorId = self.crypto?.randomUUID ? self.crypto.randomUUID() : String(Date.now());
      localStorage.setItem("visitorId", visitorId);
    }

    const payload: TrackPayload = {
      code: code || partner,
      source,
      medium,
      campaign,
      content,
      term,
      partner,
      landingPath: url.pathname + url.search,
      referrer: document.referrer || undefined,
      visitorId,
    };

    // Fire and forget; errors are non‑blocking
    fetch("/api/referrals/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      /* ignore */
    });

    sessionStorage.setItem(sessionKey, "1");
  }, []);

  // Nothing to render
  return null;
}
