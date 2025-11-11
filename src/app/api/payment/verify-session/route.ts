import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Accept both "paid" (card payments) and "unpaid" with valid payment intent (SEPA)
    // SEPA payments show as "unpaid" initially but will be processed asynchronously
    const isSuccessful =
      session.payment_status === "paid" ||
      (session.payment_status === "unpaid" && session.payment_intent);

    if (isSuccessful) {
      return NextResponse.json({
        success: true,
        email: session.customer_email,
        metadata: session.metadata,
        paymentStatus: session.payment_status, // Include status for frontend
        paymentMethod: session.payment_method_types?.[0] || "unknown",
        amount: session.amount_total || 0,
        currency: session.currency?.toUpperCase() || "EUR",
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Payment not completed",
        paymentStatus: session.payment_status,
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error verifying session:", error);
    return NextResponse.json({ error: "Failed to verify session" }, { status: 500 });
  }
}
