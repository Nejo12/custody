import { NextRequest, NextResponse } from "next/server";
import { stripe, PRICING, PricingTier } from "@/lib/stripe";
import { getClientKey, rateLimit, rateLimitResponse } from "@/lib/ratelimit";
import Stripe from "stripe";
import StripeError from "stripe";

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
    const origin = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

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
    const configured = (process.env.STRIPE_PAYMENT_METHODS || "card,sepa_debit,giropay")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const attemptCreate = async (methods: string[]) =>
      stripe.checkout.sessions.create({
        payment_method_types: methods.map(
          (m) => m as Stripe.Checkout.SessionCreateParams.PaymentMethodType
        ),
        line_items: [
          {
            price_data: {
              currency: pricing.currency,
              product_data: {
                name: pricing.name,
                description: pricing.description,
                images: ["https://custodyclarity.com/og"],
              },
              unit_amount: pricing.price,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/result?payment=cancelled`,
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

    let session;
    try {
      session = await attemptCreate(configured);
    } catch (err: unknown) {
      // If payment method not active or invalid, gracefully fall back to card
      const msg = (err instanceof Error ? err.message : "").toLowerCase();
      const code = String(
        err instanceof Error ? (err as unknown as StripeError & { code: string }).code : undefined
      );
      const shouldFallback =
        code.includes("payment_method_unactivated") ||
        msg.includes("giropay") ||
        msg.includes("sepa") ||
        msg.includes("payment_method_types");
      if (shouldFallback && configured.join(",") !== "card") {
        console.warn("Falling back to card-only due to:", err instanceof Error ? err.message : err);
        session = await attemptCreate(["card"]);
      } else {
        throw err;
      }
    }

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: unknown) {
    console.error(
      "Error creating checkout session:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : "Unknown error",
        code:
          error instanceof Error
            ? (error as unknown as StripeError & { code: string }).code
            : undefined,
        type:
          error instanceof Error
            ? (error as unknown as StripeError & { error: string }).error
            : undefined,
      },
      { status: 500 }
    );
  }
}
