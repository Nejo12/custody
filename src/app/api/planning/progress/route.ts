import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * Planning Progress API
 * Handles saving and loading planning checklist progress
 */

interface SaveProgressRequest {
  checklistId: string;
  email?: string;
  userId?: string;
  completedItems: string[];
  progressData: {
    lastUpdated: string;
    completionPercentage: number;
    totalItems: number;
    completedCount: number;
  };
}

/**
 * POST /api/planning/progress
 * Save or update progress
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SaveProgressRequest;

    // Validate required fields
    if (!body.checklistId || !body.completedItems || !body.progressData) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // At least one identifier is required
    if (!body.email && !body.userId) {
      return NextResponse.json(
        { success: false, error: "Either email or userId is required" },
        { status: 400 }
      );
    }

    // Upsert progress to database
    const { data, error } = await supabase
      .from("planning_progress")
      .upsert(
        {
          checklist_id: body.checklistId,
          user_id: body.userId || null,
          email: body.email || null,
          completed_items: body.completedItems,
          progress_data: body.progressData,
          last_updated: new Date().toISOString(),
        },
        {
          onConflict: "checklist_id",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Error saving progress:", error);
      return NextResponse.json(
        { success: false, error: "Failed to save progress" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      progress: {
        checklistId: data.checklist_id,
        completedItems: data.completed_items,
        progressData: data.progress_data,
      },
    });
  } catch (error) {
    console.error("Error in POST /api/planning/progress:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/planning/progress
 * Load progress by checklistId, email, or userId
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const checklistId = searchParams.get("checklistId");
    const email = searchParams.get("email");
    const userId = searchParams.get("userId");

    if (!checklistId && !email && !userId) {
      return NextResponse.json(
        { success: false, error: "At least one query parameter is required" },
        { status: 400 }
      );
    }

    // Build query
    let query = supabase.from("planning_progress").select("*");

    if (checklistId) {
      query = query.eq("checklist_id", checklistId);
    } else if (email) {
      query = query.eq("email", email).order("last_updated", { ascending: false }).limit(1);
    } else if (userId) {
      query = query.eq("user_id", userId).order("last_updated", { ascending: false }).limit(1);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error loading progress:", error);
      return NextResponse.json(
        { success: false, error: "Failed to load progress" },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ success: false, error: "Progress not found" }, { status: 404 });
    }

    const progress = data[0];

    return NextResponse.json({
      success: true,
      progress: {
        checklistId: progress.checklist_id,
        completedItems: progress.completed_items,
        progressData: progress.progress_data,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/planning/progress:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
