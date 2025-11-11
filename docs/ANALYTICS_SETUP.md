# Google Analytics 4 Setup Guide

## Step 1: Create Google Analytics 4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Sign in with your Google account
3. Click **Admin** (gear icon) in the bottom left
4. In the **Property** column, click **Create Property**
5. Fill in:
   - Property name: `Custody Clarity`
   - Reporting time zone: `(GMT+01:00) Berlin`
   - Currency: `Euro (€)`
6. Click **Next** and complete the business information
7. Click **Create**

## Step 2: Get Your Measurement ID

1. After creating the property, you'll see **Data Streams**
2. Click **Add stream** → **Web**
3. Enter:
   - Website URL: `https://custodyclarity.com`
   - Stream name: `Custody Clarity Web`
4. Click **Create stream**
5. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)

## Step 3: Add to Environment Variables

### Local Development (.env.local)

Add this line to your `.env.local` file:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Replace `G-XXXXXXXXXX` with your actual Measurement ID.

### Production (Netlify)

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Click **Add variable**
5. Add:
   - **Key**: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - **Value**: `G-XXXXXXXXXX` (your Measurement ID)
6. Click **Save**
7. **Redeploy** your site for changes to take effect

## Step 4: Verify Analytics is Working

1. Visit your website
2. Open browser DevTools → **Network** tab
3. Filter by `gtag` or `google-analytics`
4. You should see requests to `www.google-analytics.com`
5. In Google Analytics, go to **Reports** → **Realtime**
6. You should see your visit appear within 30 seconds

## What Gets Tracked

The Analytics component automatically tracks:

- **Page views** - Every page navigation
- **Custom events** - Newsletter signups, reminder scheduling
- **Conversions** - Payment completions with transaction details

## Testing Locally

Analytics will only work in production or if you set the environment variable locally. To test locally:

1. Add `NEXT_PUBLIC_GA_MEASUREMENT_ID` to `.env.local`
2. Restart your dev server: `npm run dev`
3. Visit `http://localhost:3000`
4. Check Network tab for GA requests

## Privacy Considerations

- Analytics respects user privacy settings
- No personally identifiable information is tracked
- Complies with GDPR (no cookies set by default in GA4)
- Users can opt out via browser settings

---

**Next Step**: Run database migrations → See `DATABASE_MIGRATIONS.md`
