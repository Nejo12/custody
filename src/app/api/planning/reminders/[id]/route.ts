import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * DELETE /api/planning/reminders/[id]
 * Cancel a reminder
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const reminderId = parseInt(resolvedParams.id, 10);

    if (isNaN(reminderId)) {
      return NextResponse.json({ success: false, error: "Invalid reminder ID" }, { status: 400 });
    }

    // Update status to cancelled
    const { error } = await supabase
      .from("planning_reminders")
      .update({ status: "cancelled" })
      .eq("id", reminderId);

    if (error) {
      console.error("Error cancelling reminder:", error);
      return NextResponse.json(
        { success: false, error: "Failed to cancel reminder" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Reminder cancelled",
    });
  } catch (error) {
    console.error("Error in DELETE /api/planning/reminders/[id]:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
