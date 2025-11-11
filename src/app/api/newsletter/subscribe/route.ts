import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getClientKey, rateLimit, rateLimitResponse } from "@/lib/ratelimit";

interface SubscribeRequest {
  email: string;
}

/**
 * Newsletter subscription endpoint
 * Stores email addresses in Supabase for marketing/updates
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limiting - 5 requests per hour per IP
    const key = getClientKey(req, "newsletter:subscribe");
    const rl = await rateLimit(key, 5, 60 * 60 * 1000);

    if (!rl.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many requests. Please try again later.",
          retryAfter: rl.resetAt,
        },
        {
          status: 429,
          headers: {
            ...rateLimitResponse(rl.remaining, rl.resetAt),
            "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }

    // Parse and validate request body
    const body = (await req.json()) as SubscribeRequest;
    const { email } = body;

    // Validate email format
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid email address is required" },
        { status: 400 }
      );
    }

    // Normalize email (lowercase, trim)
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existing) {
      // Email already subscribed - return success (idempotent)
      return NextResponse.json({
        success: true,
        message: "Email already subscribed",
      });
    }

    // Insert new subscriber
    const { error: insertError } = await supabase.from("newsletter_subscribers").insert({
      email: normalizedEmail,
      subscribed_at: new Date().toISOString(),
      source: req.headers.get("referer") || "unknown",
    });

    if (insertError) {
      console.error("Error inserting newsletter subscriber:", insertError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to subscribe. Please try again later.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to newsletter",
    });
  } catch (error) {
    console.error("Error in newsletter subscription:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
