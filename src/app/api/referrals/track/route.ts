import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getClientKey, rateLimit, rateLimitResponse } from "@/lib/ratelimit";

type TrackBody = {
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
 * Record a lightweight referral/UTM event for basic attribution.
 * Idempotency is best‑effort client side via sessionStorage; this
 * endpoint is still rate‑limited server‑side.
 */
export async function POST(req: NextRequest) {
  try {
    const key = getClientKey(req, "referrals:track");
    const rl = await rateLimit(key, 20, 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests" },
        { status: 429, headers: rateLimitResponse(rl.remaining, rl.resetAt) }
      );
    }

    const body = (await req.json()) as TrackBody;
    const {
      code,
      source,
      medium,
      campaign,
      content,
      term,
      partner,
      landingPath,
      referrer,
      visitorId,
    } = body;

    // Validate minimal required fields
    if (!landingPath || typeof landingPath !== "string" || landingPath.length > 2048) {
      return NextResponse.json(
        { success: false, error: "landingPath is required" },
        { status: 400, headers: rateLimitResponse(rl.remaining, rl.resetAt) }
      );
    }
    if (!visitorId || typeof visitorId !== "string" || visitorId.length > 128) {
      return NextResponse.json(
        { success: false, error: "visitorId is required" },
        { status: 400, headers: rateLimitResponse(rl.remaining, rl.resetAt) }
      );
    }

    // Insert record
    const { error } = await supabase.from("referrals").insert({
      code: code || null,
      source: source || null,
      medium: medium || null,
      campaign: campaign || null,
      content: content || null,
      term: term || null,
      partner: partner || null,
      landing_path: landingPath,
      referrer_url: referrer || null,
      visitor_id: visitorId,
      user_email: null, // Optionally set later when email is known
      created_at: new Date().toISOString(),
    });

    if (error) {
      // Log but do not leak internals
      console.error("referrals.insert error", error);
      return NextResponse.json(
        { success: false, error: "Failed to record referral" },
        { status: 500, headers: rateLimitResponse(rl.remaining, rl.resetAt) }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200, headers: rateLimitResponse(rl.remaining, rl.resetAt) }
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
