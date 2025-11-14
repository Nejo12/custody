import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { randomBytes } from "crypto";

/**
 * Planning Progress Sharing API
 * Handles creating and accessing shared progress links
 */

interface CreateShareLinkRequest {
  checklistId: string;
  email?: string;
  userId?: string;
  expiresInDays?: number; // Default: 30 days
}

/**
 * POST /api/planning/progress/share
 * Create a shareable link for progress
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateShareLinkRequest;

    // Validate required fields
    if (!body.checklistId) {
      return NextResponse.json(
        { success: false, error: "checklistId is required" },
        { status: 400 }
      );
    }

    // Verify that the progress exists and belongs to the user
    let query = supabase.from("planning_progress").select("*").eq("checklist_id", body.checklistId);

    if (body.email) {
      query = query.eq("email", body.email);
    } else if (body.userId) {
      query = query.eq("user_id", body.userId);
    } else {
      return NextResponse.json(
        { success: false, error: "Either email or userId is required" },
        { status: 400 }
      );
    }

    const { data: progressData, error: progressError } = await query.single();

    if (progressError || !progressData) {
      return NextResponse.json(
        { success: false, error: "Progress not found or access denied" },
        { status: 404 }
      );
    }

    // Generate a unique share token
    const shareToken = randomBytes(32).toString("hex");

    // Calculate expiration date
    const expiresInDays = body.expiresInDays || 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Store share link in database (we'll use a new table or metadata)
    // For now, we'll store it in the progress metadata
    const metadata = (progressData.progress_data as Record<string, unknown>) || {};
    const shareLinks = (metadata.shareLinks as Array<{ token: string; expiresAt: string }>) || [];

    // Add new share link
    shareLinks.push({
      token: shareToken,
      expiresAt: expiresAt.toISOString(),
    });

    // Update progress with share links
    const { error: updateError } = await supabase
      .from("planning_progress")
      .update({
        progress_data: {
          ...metadata,
          shareLinks,
        },
      })
      .eq("checklist_id", body.checklistId);

    if (updateError) {
      console.error("Error creating share link:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to create share link" },
        { status: 500 }
      );
    }

    // Return share link
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://custodyclarity.com"}/planning/progress/shared/${shareToken}`;

    return NextResponse.json({
      success: true,
      shareUrl,
      shareToken,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Error in POST /api/planning/progress/share:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/planning/progress/share?token=xxx
 * Get progress via share token
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Share token is required" },
        { status: 400 }
      );
    }

    // Find progress with this share token
    const { data: progressList, error: fetchError } = await supabase
      .from("planning_progress")
      .select("*");

    if (fetchError) {
      console.error("Error fetching progress:", fetchError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch progress" },
        { status: 500 }
      );
    }

    // Find progress with matching token
    let sharedProgress: (typeof progressList)[0] | null = null;

    for (const progress of progressList || []) {
      const metadata = (progress.progress_data as Record<string, unknown>) || {};
      const shareLinks = (metadata.shareLinks as Array<{ token: string; expiresAt: string }>) || [];

      const shareLink = shareLinks.find((link) => link.token === token);

      if (shareLink) {
        // Check if expired
        const expiresAt = new Date(shareLink.expiresAt);
        if (expiresAt > new Date()) {
          sharedProgress = progress;
          break;
        }
      }
    }

    if (!sharedProgress) {
      return NextResponse.json(
        { success: false, error: "Share link not found or expired" },
        { status: 404 }
      );
    }

    // Return progress (without sensitive data)
    return NextResponse.json({
      success: true,
      progress: {
        checklistId: sharedProgress.checklist_id,
        completedItems: sharedProgress.completed_items,
        progressData: {
          completionPercentage: (sharedProgress.progress_data as Record<string, unknown>)
            .completionPercentage,
          totalItems: (sharedProgress.progress_data as Record<string, unknown>).totalItems,
          completedCount: (sharedProgress.progress_data as Record<string, unknown>).completedCount,
        },
        lastUpdated: sharedProgress.last_updated,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/planning/progress/share:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
