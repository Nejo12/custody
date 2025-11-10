import { NextRequest, NextResponse } from "next/server";
import { stripe, PricingTier } from "@/lib/stripe";
import { sendPDFEmail } from "@/lib/email";

/**
 * Generate PDF and send via email after payment
 * This endpoint is called after successful payment
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    // Verify the payment session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    const { customer_email, metadata } = session;

    if (!customer_email || !metadata) {
      return NextResponse.json({ error: "Missing customer email or metadata" }, { status: 400 });
    }

    const tier = metadata.tier as PricingTier;
    const documentType = metadata.documentType || "custody-document";

    // Generate PDF based on the tier and document type
    // For now, we'll use the existing PDF generation logic
    // You'll need to integrate this with your existing PDF generation

    try {
      // TODO: Integrate with existing PDF generation
      // This is a placeholder - you'll need to call your actual PDF generation logic
      const pdfBuffer = await generatePDF(metadata, tier);

      // Send PDF via email
      const emailResult = await sendPDFEmail({
        to: customer_email,
        documentType,
        pdfBuffer,
        fileName: `${documentType}-${Date.now()}.pdf`,
        tier,
      });

      if (!emailResult.success) {
        return NextResponse.json(
          { error: "Failed to send email", details: emailResult.error },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Document generated and sent successfully",
      });
    } catch (error) {
      console.error("Error generating or sending document:", error);
      return NextResponse.json(
        {
          error: "Failed to generate document",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in generate-and-send:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Placeholder for PDF generation
 * TODO: Integrate with your existing PDF generation logic from src/app/api/pdf/*
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function generatePDF(metadata: Record<string, string>, tier: PricingTier): Promise<Buffer> {
  // This is a placeholder
  // You'll need to call your existing PDF generation logic here
  // For example:
  // - /api/pdf/gemeinsame-sorge for joint custody
  // - /api/pdf/umgangsregelung for contact orders
  // - etc.

  // For now, return a simple buffer
  // In production, this should generate actual PDFs
  throw new Error("PDF generation not yet integrated. Please integrate with existing PDF routes.");
}
