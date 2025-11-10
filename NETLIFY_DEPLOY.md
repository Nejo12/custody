# Netlify Deployment Guide

## Required Environment Variables

Set these in **Netlify Dashboard → Site Settings → Environment Variables**

### 🔴 CRITICAL (App won't work without these)

#### Stripe (Payment Processing)

```
STRIPE_SECRET_KEY=sk_live_... (or sk_test_... for testing)
STRIPE_WEBHOOK_SECRET=whsec_... (get from Stripe Dashboard → Webhooks)
```

**How to get:**

1. Go to https://dashboard.stripe.com/test/apikeys (test) or https://dashboard.stripe.com/apikeys (live)
2. Copy **Secret key** → set as `STRIPE_SECRET_KEY`
3. For webhook: https://dashboard.stripe.com/test/webhooks → Create endpoint → Copy signing secret → set as `STRIPE_WEBHOOK_SECRET`

#### Supabase (Database)

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (service_role key, NOT anon key)
```

**How to get:**

1. Go to https://supabase.com/dashboard → Your project → Settings → API
2. Copy **Project URL** → set as `SUPABASE_URL`
3. Copy **service_role** key (NOT anon key) → set as `SUPABASE_SERVICE_ROLE_KEY`

#### App URL (Required for Stripe redirects)

```
NEXT_PUBLIC_APP_URL=https://custodyclarity.com
```

### 🟡 IMPORTANT (Features won't work without these)

#### Upstash Redis (Rate Limiting)

```
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-rest-token
```

**How to get:**

1. Go to https://console.upstash.com → Your database → REST API tab
2. Copy **UPSTASH_REDIS_REST_URL** and **UPSTASH_REDIS_REST_TOKEN**

#### OpenAI (AI Features)

```
OPENAI_API_KEY=sk-...
```

**Optional (with defaults):**

```
OPENAI_API_BASE=https://api.openai.com/v1 (default)
OPENAI_MODEL=gpt-4o-mini (default)
OPENAI_TRANSCRIBE_MODEL=gpt-4o-mini-transcribe (default)
```

**How to get:**

1. Go to https://platform.openai.com/api-keys
2. Create new secret key → copy → set as `OPENAI_API_KEY`

### 🟢 OPTIONAL (Nice to have)

#### Resend (Email Delivery)

```
RESEND_API_KEY=re_...
```

**How to get:**

1. Go to https://resend.com/api-keys
2. Create API key → copy → set as `RESEND_API_KEY`
3. Verify domain: https://resend.com/domains

---

## Deployment Steps

### 1. Connect Repository to Netlify

1. Go to https://app.netlify.com
2. **Add new site** → **Import an existing project**
3. Connect your Git provider (GitHub/GitLab)
4. Select your `custody` repository

### 2. Configure Build Settings

Netlify should auto-detect Next.js, but verify:

- **Build command:** `npm run build`
- **Publish directory:** `.next`

### 3. Set Environment Variables

1. Go to **Site Settings** → **Environment Variables**
2. Add ALL variables from the list above
3. **Important:** Set different values for:
   - **Production:** Use live Stripe keys, production URLs
   - **Deploy Previews:** Use test Stripe keys (optional)

### 4. Configure Stripe Webhook

1. In Stripe Dashboard → **Webhooks** → **Add endpoint**
2. **Endpoint URL:** `https://custodyclarity.com/api/payment/webhook`
3. **Events to send:** Select:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
4. Copy the **Signing secret** → Add to Netlify as `STRIPE_WEBHOOK_SECRET`

### 5. Deploy

1. **Trigger deploy** (or push to main branch)
2. Wait for build to complete
3. Check **Deploy logs** for any errors

---

## Testing After Deployment

### 1. Test Basic Functionality

- Visit `https://custodyclarity.com`
- Complete the interview flow
- Check if results page loads

### 2. Test Stripe Integration

- Go to result page → Click pricing
- Use Stripe test card: `4242 4242 4242 4242`
- Complete checkout
- Verify webhook receives event (check Stripe Dashboard → Events)

### 3. Test AI Features (if configured)

- Try "Ask Assistant" in interview
- Test voice input/transcription
- Check rate limiting works

### 4. Check Logs

- Netlify Dashboard → **Functions** → Check serverless function logs
- Look for errors related to missing env vars

---

## Common Issues

### ❌ "STRIPE_SECRET_KEY is not set"

**Fix:** Add `STRIPE_SECRET_KEY` to Netlify environment variables

### ❌ "Webhook signature verification failed"

**Fix:**

1. Ensure `STRIPE_WEBHOOK_SECRET` is set correctly
2. Webhook URL in Stripe must match your Netlify domain
3. Redeploy after setting webhook secret

### ❌ "Missing Supabase environment variables"

**Fix:** Add both `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

### ❌ Rate limiting not working

**Fix:** Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

### ❌ AI features not working

**Fix:** Add `OPENAI_API_KEY` (or features will use fallback heuristics)

### ❌ Email not sending

**Fix:** Add `RESEND_API_KEY` and verify domain in Resend dashboard

---

## Security Checklist

- ✅ **Never commit** `.env.local` or `.env` files
- ✅ Use **service_role** key for Supabase (server-side only)
- ✅ Use **test keys** for Stripe during development
- ✅ Use **live keys** only in production
- ✅ Rotate keys if exposed
- ✅ Enable **2FA** on all service accounts

---

## Cost Estimates (Monthly)

- **Netlify:** Free tier (100GB bandwidth) or Pro ($19/mo)
- **Stripe:** 1.4% + €0.25 per transaction (EU)
- **Supabase:** Free tier (500MB database) or Pro ($25/mo)
- **Upstash:** Free tier (10K commands/day) or Pay-as-you-go
- **OpenAI:** ~$0.15 per 1M tokens (gpt-4o-mini)
- **Resend:** Free tier (3K emails/mo) or Pro ($20/mo)

**Total (free tier):** ~$0-50/month depending on usage
**Total (with growth):** ~$100-300/month at scale

---

## Quick Reference: All Variables

```bash
# Required
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_APP_URL=https://custodyclarity.com

# Important
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
OPENAI_API_KEY=sk-...

# Optional
RESEND_API_KEY=re_...
OPENAI_API_BASE=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```

---

## Next Steps After Deployment

1. ✅ Set up **custom domain** (already configured in `netlify.toml`)
2. ✅ Enable **HTTPS** (automatic on Netlify)
3. ✅ Configure **analytics** (optional: Netlify Analytics)
4. ✅ Set up **monitoring** (Sentry, LogRocket, etc.)
5. ✅ Test **payment flow** end-to-end
6. ✅ Verify **webhook** receives events
7. ✅ Check **email delivery** works
8. ✅ Monitor **error logs** for first week

---

**Need help?** Check Netlify docs: https://docs.netlify.com/
