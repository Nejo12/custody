import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * Planning Reminders API
 * Handles scheduling and managing reminders for planning checklist items
 */

interface ScheduleReminderRequest {
  email: string;
  checklistId?: string;
  itemId: string;
  reminderDate: string; // ISO string
  summary: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * POST /api/planning/reminders
 * Schedule a new reminder
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ScheduleReminderRequest;

    // Validate required fields
    if (!body.email || !body.itemId || !body.reminderDate || !body.summary) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate date
    const reminderDate = new Date(body.reminderDate);
    if (isNaN(reminderDate.getTime())) {
      return NextResponse.json({ success: false, error: "Invalid reminder date" }, { status: 400 });
    }

    // Check if date is in the future
    if (reminderDate <= new Date()) {
      return NextResponse.json(
        { success: false, error: "Reminder date must be in the future" },
        { status: 400 }
      );
    }

    // Insert reminder
    const { data, error } = await supabase
      .from("planning_reminders")
      .insert({
        email: body.email,
        checklist_id: body.checklistId || null,
        item_id: body.itemId,
        reminder_date: reminderDate.toISOString(),
        summary: body.summary,
        description: body.description || null,
        status: "pending",
        metadata: body.metadata || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error scheduling reminder:", error);
      return NextResponse.json(
        { success: false, error: "Failed to schedule reminder" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reminder: {
        id: data.id,
        email: data.email,
        itemId: data.item_id,
        reminderDate: data.reminder_date,
        summary: data.summary,
      },
    });
  } catch (error) {
    console.error("Error in POST /api/planning/reminders:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/planning/reminders
 * List reminders for a checklist or email
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const checklistId = searchParams.get("checklistId");
    const email = searchParams.get("email");

    if (!checklistId && !email) {
      return NextResponse.json(
        { success: false, error: "Either checklistId or email is required" },
        { status: 400 }
      );
    }

    // Build query
    let query = supabase.from("planning_reminders").select("*").order("reminder_date", {
      ascending: true,
    });

    if (checklistId) {
      query = query.eq("checklist_id", checklistId);
    }
    if (email) {
      query = query.eq("email", email);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error loading reminders:", error);
      return NextResponse.json(
        { success: false, error: "Failed to load reminders" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reminders:
        data?.map((reminder) => ({
          id: reminder.id,
          email: reminder.email,
          checklistId: reminder.checklist_id,
          itemId: reminder.item_id,
          reminderDate: reminder.reminder_date,
          summary: reminder.summary,
          description: reminder.description,
          status: reminder.status,
          sentAt: reminder.sent_at,
        })) || [],
    });
  } catch (error) {
    console.error("Error in GET /api/planning/reminders:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
