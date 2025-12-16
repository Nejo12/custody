import { NextRequest, NextResponse } from "next/server";
import { getClientKey, rateLimit, rateLimitResponse } from "@/lib/ratelimit";

interface ScheduleReminderRequest {
  email: string;
  reminderDate: string; // ISO 8601 date string
  summary: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Schedule a court filing reminder
 * Creates a reminder record that will be sent via email on the specified date
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limiting - 10 requests per hour per IP
    const key = getClientKey(req, "reminders:schedule");
    const rl = await rateLimit(key, 10, 60 * 60 * 1000);

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
    const body = (await req.json()) as ScheduleReminderRequest;
    const { email, reminderDate, summary } = body;

    // Validate required fields
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid email address is required" },
        { status: 400 }
      );
    }

    if (!reminderDate || typeof reminderDate !== "string") {
      return NextResponse.json(
        { success: false, error: "Reminder date is required" },
        { status: 400 }
      );
    }

    if (!summary || typeof summary !== "string" || summary.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Summary is required" }, { status: 400 });
    }

    // Validate reminder date is in the future
    const reminderDateTime = new Date(reminderDate);
    const now = new Date();

    if (isNaN(reminderDateTime.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid reminder date format" },
        { status: 400 }
      );
    }

    if (reminderDateTime <= now) {
      return NextResponse.json(
        { success: false, error: "Reminder date must be in the future" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in POST /api/reminders/schedule:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
