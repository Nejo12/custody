# Minimal Auth + Subscription Schema (Option 1)

This document outlines the smallest viable set of tables and flows to add a freemium subscription model on top of the current app.

## Goals

- Keep interview/results free (anonymous is fine)
- Add subscriptions (monthly/yearly) for premium features
- Allow email‑based purchases now; migrate to accounts when ready

## Stack Choices

- Auth provider: Clerk or Supabase Auth (either is fine)
- Billing: Stripe Billing (Customer, Subscription, Webhooks)
- DB: Supabase

## Database Tables

### 1) `users`

- `id` (uuid, primary key) – auth provider id
- `email` (text, unique, nullable) – set from auth
- `created_at` (timestamptz, default now)

Note: If you start without auth, this table can be optional; use `email` only in `subscriptions` until auth is added.

### 2) `subscriptions`

- `id` (bigserial, pk)
- `user_id` (uuid, nullable) – fk to `users.id`
- `email` (text, not null) – billing email for anonymous users
- `stripe_customer_id` (text, unique, not null)
- `stripe_subscription_id` (text, unique, not null)
- `tier` (text, not null) – e.g., `PRO` or `ANNUAL`
- `status` (text, not null) – `active|trialing|past_due|canceled|incomplete|incomplete_expired|unpaid`
- `current_period_end` (timestamptz, not null)
- `cancel_at_period_end` (boolean, default false)
- `created_at` (timestamptz, default now)
- Indexes: `idx_subscriptions_user`, `idx_subscriptions_status`

### 3) `entitlements`

- `id` (bigserial, pk)
- `user_id` (uuid, nullable)
- `email` (text, not null)
- `feature` (text, not null) – gates (e.g., `unlimited_pdfs`, `priority_ai`)
- `active` (boolean, default true)
- `source` (text) – `subscription`, `promotion`, `manual`
- `expires_at` (timestamptz, nullable)
- Composite unique: `(email, feature, active)`

This allows easy toggling of premium features even without full auth.

## Stripe Setup

1. Create Prices (Monthly/Annual) for a `Pro` product
2. Use Checkout Session for subscription `mode: subscription`
3. Handle webhook events:
   - `customer.subscription.created` / `updated` – upsert `subscriptions` and `entitlements`
   - `customer.subscription.deleted` – deactivate relevant entitlements

## API Additions (Minimal)

- `POST /api/payment/create-subscription` – start Stripe Checkout for subscriptions
- `POST /api/payment/webhook` – extend handler to process subscription events
- `GET /api/subscription/status?email=` – check if user/email is entitled to features (cacheable)

## Gating Premium Features

Use a single helper:

```ts
// pseudo signature
async function hasEntitlement({
  email,
  feature,
}: {
  email: string;
  feature: string;
}): Promise<boolean>;
```

Gate at UI actions (e.g., unlimited PDF, advanced reminders, priority AI). If no auth, ask for email to check status.

## Migration Plan

1. Add `subscriptions` and `entitlements` tables
2. Implement webhook upsert logic
3. Add `GET /api/subscription/status` endpoint
4. Gate 1–2 features to validate demand
5. Later: add auth provider and attach `user_id`

## Security & Privacy

- Don’t store PII beyond email necessary for billing
- Webhook path must verify signature
- Implement rate limiting on status endpoints

## Example Premium Mapping

- `unlimited_pdfs` – Pro only
- `priority_ai` – Pro only
- `advanced_reminders` – Pro only
- `template_library` – Pro only
