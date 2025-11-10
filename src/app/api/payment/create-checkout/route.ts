import { NextRequest, NextResponse } from "next/server";
import { stripe, PRICING, PricingTier } from "@/lib/stripe";
import { getClientKey, rateLimit, rateLimitResponse } from "@/lib/ratelimit";

interface CheckoutRequest {
  tier: PricingTier;
  email: string;
  documentType: string;
  metadata?: Record<string, string>;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const key = getClientKey(req, "payment:checkout");
    const rl = await rateLimit(key, 10, 60_000);

    if (!rl.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          retryAfter: rl.resetAt,
        },
        {
          status: 429,
          headers: {
            ...rateLimitResponse(rl.remaining, rl.resetAt),
            "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }

    // Parse request body
    const body = (await req.json()) as CheckoutRequest;
    const { tier, email, documentType, metadata = {} } = body;

    // Validate tier
    if (!PRICING[tier]) {
      return NextResponse.json({ error: "Invalid pricing tier" }, { status: 400 });
    }

    // Validate email
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    // Get pricing details
    const pricing = PRICING[tier];

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "sepa_debit", "giropay"],
      line_items: [
        {
          price_data: {
            currency: pricing.currency,
            product_data: {
              name: pricing.name,
              description: pricing.description,
              images: ["https://custodyclarity.com/og"], // Use your OG image
            },
            unit_amount: pricing.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/result?payment=cancelled`,
      customer_email: email,
      metadata: {
        tier,
        documentType,
        email,
        ...metadata,
      },
      billing_address_collection: "required",
      phone_number_collection: {
        enabled: false,
      },
      // Statement descriptors - appears on customer bank statements
      payment_intent_data: {
        statement_descriptor: "CUSTODYCLARITY", // Main descriptor (5-22 chars)
        statement_descriptor_suffix: "PDF", // Optional suffix for individual products
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
