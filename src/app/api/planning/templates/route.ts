import { NextRequest, NextResponse } from "next/server";
import { generateDocumentTemplate, type TemplateUserData } from "@/lib/document-templates";

/**
 * Planning Document Templates API
 * Generates fillable document templates for common custody-related forms
 * Phase 3.3: Document Templates
 */

/**
 * POST /api/planning/templates
 * Generate a document template
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      type:
        | "vaterschaftsanerkennung"
        | "sorgerechtserklaerung"
        | "kindergeld-checklist"
        | "emergency-custody"
        | "coparenting-agreement";
      data: TemplateUserData;
      locale?: string;
    };

    // Validate required fields
    if (!body.type || !body.data) {
      return NextResponse.json(
        { success: false, error: "Type and data are required" },
        { status: 400 }
      );
    }

    // Generate PDF template
    const pdfBytes = await generateDocumentTemplate(body.type, body.data, body.locale || "de");

    // Return PDF as response
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${body.type}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating document template:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate template",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/planning/templates
 * List available template types
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    templates: [
      {
        type: "vaterschaftsanerkennung",
        name: "Vaterschaftsanerkennung",
        description: "Paternity acknowledgment form template",
        locale: "de",
      },
      {
        type: "sorgerechtserklaerung",
        name: "Sorgeerklärung",
        description: "Joint custody declaration template",
        locale: "de",
      },
      {
        type: "kindergeld-checklist",
        name: "Kindergeld Checklist",
        description: "Child benefit application checklist",
        locale: "de",
      },
      {
        type: "emergency-custody",
        name: "Emergency Custody Declaration",
        description: "Emergency custody declaration template",
        locale: "de",
      },
      {
        type: "coparenting-agreement",
        name: "Co-Parenting Agreement",
        description: "Co-parenting agreement outline template",
        locale: "de",
      },
    ],
  });
}
