# 💳 Payment Integration Setup Guide

**Status**: ✅ Code Complete | ⏳ Configuration Needed

You've got all the code in place! Now you just need to configure your Stripe and Resend accounts. This will take about **30 minutes**.

---

## 📋 Quick Checklist

- [ ] Create Stripe account
- [ ] Get Stripe API keys
- [ ] Set up Stripe webhook
- [ ] Create Resend account
- [ ] Get Resend API key
- [ ] Configure domain for sending emails
- [ ] Add all keys to `.env.local`
- [ ] Test payment flow
- [ ] Deploy to Netlify with environment variables

---

## 1️⃣ Stripe Setup (15 minutes)

### Step 1: Create Account

1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Sign up with your email
3. Choose **Germany** as your country
4. Complete business details (you can use personal info for now)

### Step 2: Get API Keys

1. Go to [https://dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)
2. Copy these keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`) ⚠️ NEVER commit this to git!

3. Add to your `.env.local`:
   ```bash
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

### Step 3: Set Up Webhook (for production)

**Option A: Test Locally with Stripe CLI** (recommended for development)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/payment/webhook
```

This will give you a webhook secret like `whsec_...`. Add it to `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Option B: Production Webhook** (for Netlify deployment)

1. Go to [https://dashboard.stripe.com/test/webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click "Add endpoint"
3. Enter URL: `https://custodyclarity.com/api/payment/webhook`
4. Select event: `checkout.session.completed`
5. Copy the webhook secret and add to Netlify environment variables

### Step 4: Test Mode vs Live Mode

**Test Mode** (what you're using now):

- Keys start with `pk_test_` and `sk_test_`
- Use test card: `4242 4242 4242 4242`
- No real money changes hands

**Live Mode** (when you're ready to accept real payments):

1. Complete Stripe onboarding (add bank account, tax info)
2. Switch to "Live" mode in dashboard
3. Get live keys (start with `pk_live_` and `sk_live_`)
4. Update `.env.local` and Netlify environment variables

---

## 2️⃣ Resend Setup (10 minutes)

### Step 1: Create Account

1. Go to [https://resend.com/signup](https://resend.com/signup)
2. Sign up with your email
3. Verify your email

### Step 2: Get API Key

1. Go to [https://resend.com/api-keys](https://resend.com/api-keys)
2. Click "Create API Key"
3. Name it "Custody Clarity - Production"
4. Copy the key (starts with `re_`)

5. Add to `.env.local`:
   ```bash
   RESEND_API_KEY=re_...
   ```

### Step 3: Configure Sending Domain

**Option A: Use Resend's domain (quick start)**

- Emails will come from `onboarding@resend.dev`
- Works immediately, but looks less professional
- Good for testing

**Option B: Use your custom domain (recommended for production)**

1. Go to [https://resend.com/domains](https://resend.com/domains)
2. Click "Add Domain"
3. Enter: `custodyclarity.com`
4. Add these DNS records to Namecheap:

   **SPF Record:**

   ```
   Type: TXT
   Host: @
   Value: v=spf1 include:resend.com ~all
   ```

   **DKIM Records:** (Resend will show you these)

   ```
   Type: TXT
   Host: resend._domainkey
   Value: [provided by Resend]
   ```

   **MX Records:**

   ```
   Type: MX
   Host: @
   Priority: 10
   Value: [provided by Resend]
   ```

5. Wait 5-10 minutes for DNS propagation
6. Click "Verify" in Resend dashboard

7. Update the email sender in `src/lib/email.ts`:
   ```typescript
   from: "Custody Clarity <documents@custodyclarity.com>";
   ```

---

## 3️⃣ Environment Variables

### Complete `.env.local` File

```bash
# OpenAI (you already have this)
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_API_BASE=https://api.openai.com/v1

# Supabase (you already have this)
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...

# Upstash Redis (you already have this)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Stripe (ADD THESE)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend (ADD THIS)
RESEND_API_KEY=re_...

# App URL (update for production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 4️⃣ Netlify Deployment

### Add Environment Variables to Netlify

1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Add all the variables from `.env.local` EXCEPT:
   - Don't add anything that starts with `NEXT_PUBLIC_` here (add them as build environment variables)

5. Add these specifically:

   ```
   STRIPE_SECRET_KEY=sk_test_...  (or sk_live_... for production)
   STRIPE_WEBHOOK_SECRET=whsec_...
   RESEND_API_KEY=re_...
   OPENAI_API_KEY=sk-proj-...
   OPENAI_MODEL=gpt-4o-mini
   SUPABASE_URL=https://...
   SUPABASE_SERVICE_ROLE_KEY=...
   UPSTASH_REDIS_REST_URL=https://...
   UPSTASH_REDIS_REST_TOKEN=...
   ```

6. Add build environment variables:

   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   NEXT_PUBLIC_APP_URL=https://custodyclarity.com
   ```

7. Redeploy your site

---

## 5️⃣ Testing the Payment Flow

### Local Testing

1. **Start your dev server:**

   ```bash
   npm run dev
   ```

2. **Open in browser:**

   ```
   http://localhost:3000/result
   ```

3. **Click "Get Pro Document"**
   - You should see the pricing modal

4. **Choose a tier and enter email:**
   - Use your real email for testing
   - Click "Purchase Now"

5. **Stripe Checkout:**
   - You'll be redirected to Stripe Checkout
   - Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)

6. **Success Page:**
   - You'll be redirected to `/payment/success`
   - Check your email for confirmation

7. **Check Stripe Dashboard:**
   - Go to [https://dashboard.stripe.com/test/payments](https://dashboard.stripe.com/test/payments)
   - You should see your test payment

### Production Testing

1. **Switch to live keys** (after completing Stripe onboarding)
2. **Use a real card** (you'll actually be charged!)
3. **Test with a small amount first** (€2.99)
4. **Verify email delivery**
5. **Check Stripe dashboard for real payments**

---

## 6️⃣ Integration with Existing PDF Generation

### Current Status

The payment system is set up but needs to be connected to your existing PDF generation logic.

**What's working:**

- ✅ Payment collection
- ✅ Email delivery framework
- ✅ Success/failure handling

**What needs integration:**

- ⏳ Generate PDF after payment (currently placeholder)
- ⏳ Pass interview data to PDF generator
- ⏳ Handle different document types

### Next Steps for PDF Integration

You have existing PDF routes in `src/app/api/pdf/`:

- `/api/pdf/gemeinsame-sorge` (joint custody)
- `/api/pdf/umgangsregelung` (contact orders)
- etc.

**To connect them:**

1. **Update `/api/payment/generate-and-send/route.ts`:**

   ```typescript
   async function generatePDF(
     metadata: Record<string, string>,
     tier: PricingTier
   ): Promise<Buffer> {
     const documentType = metadata.documentType;
     const interviewData = JSON.parse(metadata.interviewData || "{}");

     // Call your existing PDF generation
     let pdfBuffer: Buffer;

     if (documentType === "joint-custody") {
       // Call gemeinsame-sorge PDF generator
       const response = await fetch("http://localhost:3000/api/pdf/gemeinsame-sorge", {
         method: "POST",
         body: JSON.stringify(interviewData),
       });
       pdfBuffer = Buffer.from(await response.arrayBuffer());
     } else if (documentType === "contact-order") {
       // Call umgangsregelung PDF generator
       // ...
     }

     return pdfBuffer;
   }
   ```

2. **Pass interview data in metadata:**
   In `GetPDFButton.tsx`, when opening the modal, pass interview data:
   ```typescript
   metadata={{
     interviewData: JSON.stringify(interview.answers),
     documentType: "joint-custody", // or "contact-order", etc.
   }}
   ```

---

## 7️⃣ Troubleshooting

### Problem: "Stripe failed to load"

**Solution:**

- Check that `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Restart your dev server after adding environment variables

### Problem: "Email not received"

**Solutions:**

1. Check spam folder
2. Verify Resend API key is correct
3. Check Resend dashboard for delivery logs: [https://resend.com/emails](https://resend.com/emails)
4. If using custom domain, verify DNS records are set up correctly

### Problem: "Webhook signature verification failed"

**Solutions:**

1. Make sure `STRIPE_WEBHOOK_SECRET` matches the one from Stripe CLI or dashboard
2. If using Stripe CLI, make sure it's running: `stripe listen --forward-to localhost:3000/api/payment/webhook`
3. Check that the webhook endpoint is publicly accessible (for production)

### Problem: "Payment succeeds but no email sent"

**Solutions:**

1. Check server logs for errors
2. Verify Resend API key is correct
3. Check Resend dashboard for failed deliveries
4. Make sure `generate-and-send` API route is being called (check webhook logs)

---

## 8️⃣ Going Live Checklist

Before accepting real payments:

- [ ] Complete Stripe business verification
- [ ] Add bank account for payouts
- [ ] Switch from test keys to live keys
- [ ] Test with a real €2.99 payment
- [ ] Verify email delivery with custom domain
- [ ] Set up Stripe webhook for production URL
- [ ] Update pricing if needed
- [ ] Add terms of service link
- [ ] Add privacy policy link
- [ ] Add refund policy
- [ ] Test on mobile devices
- [ ] Test all payment methods (card, SEPA, giropay)

---

## 9️⃣ Monitoring & Analytics

### Track Your Revenue

1. **Stripe Dashboard:**
   - https://dashboard.stripe.com/payments
   - See all payments, refunds, disputes

2. **Resend Dashboard:**
   - https://resend.com/emails
   - See email delivery status

3. **Supabase (optional):**
   - Store payment records in your database
   - Track which tiers sell best
   - See customer purchase history

### Key Metrics to Watch

- **Conversion rate:** Visitors → buyers
- **Average order value:** Which tier do people choose?
- **Email delivery rate:** Are customers getting their PDFs?
- **Customer support requests:** Are people confused?

---

## 🎉 You're Ready!

Once you've completed this setup:

1. **Test locally** with Stripe test cards
2. **Deploy to Netlify** with environment variables
3. **Test on production** with a small payment
4. **Monitor first transactions** closely
5. **Iterate based on feedback**

---

## 💬 Support

If you run into issues:

1. **Stripe Support:** https://support.stripe.com
2. **Resend Support:** support@resend.com
3. **Check server logs** for error messages
4. **Test with Stripe test cards first**

---

## 📚 Additional Resources

- [Stripe Testing](https://stripe.com/docs/testing)
- [Resend Documentation](https://resend.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)

---

Good luck! 🚀 Your first sale is just around the corner.
