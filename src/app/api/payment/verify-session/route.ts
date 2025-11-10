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

    if (session.payment_status === "paid") {
      return NextResponse.json({
        success: true,
        email: session.customer_email,
        metadata: session.metadata,
      });
    }

    return NextResponse.json({ success: false, error: "Payment not completed" }, { status: 400 });
  } catch (error) {
    console.error("Error verifying session:", error);
    return NextResponse.json({ error: "Failed to verify session" }, { status: 500 });
  }
}
