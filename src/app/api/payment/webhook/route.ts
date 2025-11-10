import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { sendOrderConfirmation, sendPDFEmail } from "@/lib/email";
import { generateCustodyPDF, InterviewData } from "@/lib/pdfGenerator";
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

        // Generate and send PDF document
        try {
          const tier = (session.metadata.tier || "BASIC").toUpperCase() as
            | "BASIC"
            | "PROFESSIONAL"
            | "ATTORNEY";
          const documentType = session.metadata.documentType || "custody-document";

          // Parse interview data from metadata
          let interviewData: InterviewData = {};

          // Check if interviewData was passed as a JSON string
          if (session.metadata.interviewData) {
            try {
              interviewData = JSON.parse(session.metadata.interviewData);
            } catch (e) {
              console.error("Failed to parse interview data:", e);
            }
          }

          // Also check for individual interview_ prefixed keys (backward compatibility)
          Object.keys(session.metadata).forEach((key) => {
            if (key.startsWith("interview_") && session.metadata) {
              const dataKey = key.replace("interview_", "");
              const value = session.metadata[key];
              // Handle arrays (children names)
              if (value && value.includes(",")) {
                interviewData[dataKey] = value.split(",").map((s) => s.trim());
              } else {
                interviewData[dataKey] = value;
              }
            }
          });

          // Generate PDF
          const pdfBuffer = await generateCustodyPDF({
            tier,
            documentType,
            interviewData,
            locale: session.metadata.locale || "en",
          });

          // Generate filename
          const timestamp = new Date().toISOString().split("T")[0];
          const fileName = `custody-${documentType}-${timestamp}.pdf`;

          // Send PDF via email
          const emailResult = await sendPDFEmail({
            to: session.customer_email,
            documentType,
            pdfBuffer,
            fileName,
            tier: tier.toLowerCase(),
          });

          if (emailResult.success) {
            console.info(`PDF sent successfully to ${session.customer_email}`); // eslint-disable-line no-console
          } else {
            console.error(`Failed to send PDF: ${emailResult.error}`);
          }
        } catch (error) {
          console.error("Error generating/sending PDF:", error);
          // Don't fail the webhook - the payment was successful
          // We can retry sending the PDF later or provide support
        }
      }

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
