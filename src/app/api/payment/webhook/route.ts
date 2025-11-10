import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { sendOrderConfirmation } from "@/lib/email";
import Stripe from "stripe";

/**
 * Stripe webhook handler
 * Handles payment success events and triggers document generation
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      console.warn("Payment successful:", {
        sessionId: session.id,
        email: session.customer_email,
        amount: session.amount_total,
        metadata: session.metadata,
      });

      // Send confirmation email
      if (session.customer_email && session.metadata) {
        await sendOrderConfirmation({
          to: session.customer_email,
          orderId: session.id,
          amount: session.amount_total ?? 0,
          tier: session.metadata.tier || "basic",
        });
      }

      // TODO: Trigger document generation
      // This will be implemented in the next step
      // For now, the user will manually generate the PDF after payment

      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.error("Payment failed:", paymentIntent.id);
      break;
    }

    default:
      console.warn(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
