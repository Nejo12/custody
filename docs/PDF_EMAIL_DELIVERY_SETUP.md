# PDF Email Delivery - Setup & Testing Guide

## ✅ What's Implemented

The complete payment → PDF generation → email delivery flow is now implemented!

**Flow:**

1. User completes interview on result page
2. Clicks "Get Professional PDF" button
3. Selects pricing tier and enters email
4. Pays via Stripe Checkout
5. **Webhook triggered** → PDF generated → Email sent with attachment

---

## 🔧 Required Environment Variables

Add these to your `.env.local` file:

```bash
# Stripe (Required for payments)
STRIPE_SECRET_KEY=sk_test_...                  # Get from https://dashboard.stripe.com/test/apikeys
STRIPE_PUBLISHABLE_KEY=pk_test_...             # Get from https://dashboard.stripe.com/test/apikeys
STRIPE_WEBHOOK_SECRET=whsec_...                # Get after setting up webhook (see below)

# Resend (Required for email delivery)
RESEND_API_KEY=re_...                          # Get from https://resend.com/api-keys

# App URL (for Stripe redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000      # Use production URL in prod
```

---

## 📋 Setup Steps

### Step 1: Set Up Stripe Account

1. **Create Stripe Account** (if you haven't already)
   - Go to https://stripe.com
   - Sign up for a free account
   - Activate test mode (toggle in top-right)

2. **Get API Keys**
   - Go to https://dashboard.stripe.com/test/apikeys
   - Copy "Publishable key" → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Click "Reveal test key" → Copy "Secret key" → `STRIPE_SECRET_KEY`

3. **Add to `.env.local`**
   ```bash
   STRIPE_SECRET_KEY=sk_test_51...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
   ```

### Step 2: Set Up Resend Account

1. **Create Resend Account**
   - Go to https://resend.com
   - Sign up with your email
   - Verify your email address

2. **Get API Key**
   - Go to https://resend.com/api-keys
   - Click "Create API Key"
   - Name it "Custody Clarity Production" or "Development"
   - Copy the key → `RESEND_API_KEY`

3. **Configure Domain (Production Only)**
   - Go to https://resend.com/domains
   - Add your domain (e.g., custodyclarity.com)
   - Add DNS records to your domain provider
   - **For testing:** You can use `onboarding@resend.dev` (no domain setup needed)

4. **Add to `.env.local`**
   ```bash
   RESEND_API_KEY=re_...
   ```

### Step 3: Set Up Stripe Webhook (For Production/Testing)

**Option A: Local Testing with Stripe CLI (Recommended for development)**

1. **Install Stripe CLI**

   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe

   # Windows (use Scoop)
   scoop install stripe

   # Or download from: https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe**

   ```bash
   stripe login
   ```

3. **Forward webhooks to localhost**

   ```bash
   stripe listen --forward-to localhost:3000/api/payment/webhook
   ```

   This will output a webhook signing secret like:

   ```
   > Ready! Your webhook signing secret is whsec_abc123...
   ```

4. **Copy the secret to `.env.local`**

   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

5. **Keep the `stripe listen` command running** while testing

**Option B: Production Webhook Setup**

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "+ Add endpoint"
3. Enter your endpoint URL: `https://custodyclarity.com/api/payment/webhook`
4. Select events to listen to:
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.payment_failed`
5. Click "Add endpoint"
6. Copy the "Signing secret" → `STRIPE_WEBHOOK_SECRET`

---

## 🧪 Testing the Flow

### Local Testing (Without Real Payment)

**Option 1: Test PDF Generation Directly**

Create a test file: `/src/lib/__tests__/pdfGenerator.test.ts`

```typescript
import { generateCustodyPDF } from "../pdfGenerator";
import fs from "fs";

describe("PDF Generator", () => {
  it("generates a basic PDF", async () => {
    const pdf = await generateCustodyPDF({
      tier: "BASIC",
      documentType: "joint-custody",
      interviewData: {
        custodyType: "Joint Custody",
        parentName: "Test Parent",
        childrenNames: ["Child 1", "Child 2"],
        coParentName: "Co-Parent",
      },
      locale: "en",
    });

    // Save to test output
    fs.writeFileSync("test-output.pdf", pdf);

    expect(pdf.length).toBeGreaterThan(0);
    console.log("PDF generated! Check test-output.pdf");
  });
});
```

Run the test:

```bash
npm test pdfGenerator.test.ts
```

**Option 2: Test Full Flow with Stripe Test Mode**

1. **Start dev server**

   ```bash
   npm run dev
   ```

2. **Start Stripe webhook listener** (in another terminal)

   ```bash
   stripe listen --forward-to localhost:3000/api/payment/webhook
   ```

3. **Complete the interview**
   - Go to http://localhost:3000
   - Answer all questions
   - Reach the result page

4. **Click "Get Professional PDF"**
   - Select a tier (try "Professional" or "Attorney" to see more content)
   - Enter your real email address
   - Click "Purchase Now"

5. **Use Stripe test card**
   - Card number: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)

6. **Complete payment**
   - Click "Pay"
   - You'll be redirected to success page

7. **Check webhook logs**
   - The `stripe listen` terminal will show the webhook event
   - Check your email inbox for the PDF

8. **Check server logs**
   - Your `npm run dev` terminal should show:
     ```
     Payment successful: { sessionId: 'cs_test_...', email: '...', ... }
     PDF sent successfully to your@email.com
     ```

---

## 📧 Email Content

Users will receive **2 emails**:

### 1. Order Confirmation (Immediate)

- Subject: "Order Confirmation - Custody Clarity"
- Content: Payment received, document being generated

### 2. PDF Delivery (Within 30 seconds)

- Subject: "Your joint-custody Document from Custody Clarity"
- Content:
  - Professional HTML email
  - PDF attached
  - Instructions for what to do next
  - Support contact info
  - Priority support notice (Attorney tier only)

---

## 🐛 Troubleshooting

### Problem: "STRIPE_SECRET_KEY not set"

**Solution:** Add your Stripe secret key to `.env.local` and restart the dev server

### Problem: "Email service not configured"

**Solution:** Add `RESEND_API_KEY` to `.env.local` and restart

### Problem: "Webhook signature verification failed"

**Solution:**

- Make sure `stripe listen` is running
- Copy the webhook secret it outputs to `.env.local`
- Restart dev server

### Problem: PDF not sent to email

**Solution:**

- Check server logs for errors
- Verify Resend API key is valid
- Check Resend dashboard for failed sends: https://resend.com/emails
- Try sending to a different email (some providers block automated emails)

### Problem: "No checkout URL received"

**Solution:**

- Check that `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Verify you're using the correct Stripe account (test mode vs live mode)

---

## 📊 Monitoring

### Stripe Dashboard

- **Payments:** https://dashboard.stripe.com/test/payments
- **Webhooks:** https://dashboard.stripe.com/test/webhooks
- **Logs:** https://dashboard.stripe.com/test/logs

### Resend Dashboard

- **Emails:** https://resend.com/emails
- **API Keys:** https://resend.com/api-keys
- **Logs:** https://resend.com/logs

---

## 🚀 Deploying to Production

### 1. Switch to Live Mode in Stripe

- Get live API keys from https://dashboard.stripe.com/apikeys
- Update `.env.production` or Netlify env vars with live keys

### 2. Configure Production Webhook

- Add webhook endpoint: `https://custodyclarity.com/api/payment/webhook`
- Copy live webhook secret to production env vars

### 3. Verify Domain in Resend

- Add your domain: `custodyclarity.com`
- Update DNS records
- Update email FROM address to `documents@custodyclarity.com`

### 4. Test End-to-End

- Use a real credit card (will charge real money!)
- Verify PDF is delivered
- Check email deliverability

---

## 💰 Pricing Tiers & PDF Content

| Tier             | Price  | PDF Content                                                                                                                |
| ---------------- | ------ | -------------------------------------------------------------------------------------------------------------------------- |
| **Basic**        | €2.99  | Basic custody info + Legal references + Disclaimer                                                                         |
| **Professional** | €9.99  | Everything in Basic + Residence arrangement + Contact schedule + Decision-making framework                                 |
| **Attorney**     | €29.99 | Everything in Professional + Submission guidelines + Evidence checklist + Court requirements + Legal representation advice |

---

## 📝 Files Modified/Created

### Created:

- ✅ `/src/lib/pdfGenerator.ts` - PDF generation service
- ✅ `/PDF_EMAIL_DELIVERY_SETUP.md` - This guide

### Modified:

- ✅ `/src/app/api/payment/webhook/route.ts` - Added PDF generation and email sending
- ✅ `/src/lib/email.ts` - Already had `sendPDFEmail` function
- ✅ `/src/app/result/page.tsx` - Already passes interview data to GetPDFButton

---

## ✅ Ready to Go!

Once you've completed the setup steps above, the full flow is ready:

1. ✅ Payment processing via Stripe
2. ✅ Automatic PDF generation with interview data
3. ✅ Email delivery with PDF attachment
4. ✅ Professional email template
5. ✅ Tier-based content (Basic/Professional/Attorney)
6. ✅ Error handling and logging

**Test it now:**

1. Complete the interview
2. Click "Get Professional PDF"
3. Use test card `4242 4242 4242 4242`
4. Check your email! 📧

---

**Questions?**

- Check server logs in terminal
- Check Stripe dashboard for payment status
- Check Resend dashboard for email delivery status
