# 🚀 Quick Setup Guide

Get your new features up and running in 15 minutes!

## Step 1: Set Up Google Analytics (5 min)

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create property → Add web stream
3. Copy Measurement ID (starts with `G-`)
4. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

## Step 2: Run Database Migrations (5 min)

### Using Supabase Dashboard:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → Your Project
2. Click **SQL Editor**
3. Open `supabase/migrations/002_create_newsletter_table.sql`
4. Copy/paste → Click **Run**
5. Open `supabase/migrations/003_create_court_reminders_table.sql`
6. Copy/paste → Click **Run**

✅ Done! Tables created.

## Step 3: Set Up Cron Job (5 min)

### Generate Secret:

```bash
openssl rand -hex 32
```

### Add to `.env.local`:

```bash
REMINDERS_CRON_SECRET=your-generated-secret-here
```

### Choose Cron Service:

**Option A: cron-job.org (Easiest)**

1. Sign up at [cron-job.org](https://cron-job.org/)
2. Create cronjob:
   - URL: `https://custodyclarity.com/api/reminders/send`
   - Method: `POST`
   - Schedule: `0 * * * *` (every hour)
   - Header: `Authorization: Bearer YOUR_SECRET_HERE`

**Option B: GitHub Actions (Free)**

1. Create `.github/workflows/send-reminders.yml` (see `docs/CRON_JOB_SETUP.md`)
2. Add secret in GitHub repo settings

## Step 4: Test Everything (5 min)

### Run Setup Helper:

```bash
./scripts/setup-env.sh
```

### Test Newsletter:

1. Visit homepage → Scroll to newsletter
2. Enter email → Click Subscribe
3. ✅ Should see success message

### Test Reminder:

1. Complete interview → Go to result page
2. Click "Schedule email reminder"
3. Enter email + future date → Click Schedule
4. ✅ Should see success message

### Test Analytics:

1. Open DevTools → Network tab
2. Visit site → Look for `gtag` requests
3. ✅ Should see GA requests

### Run Automated Tests:

```bash
./scripts/test-features.sh
```

## ✅ Verification Checklist

- [ ] Google Analytics ID added to `.env.local`
- [ ] Database migrations run (check Supabase Dashboard)
- [ ] Cron secret generated and added
- [ ] Cron job configured (or scheduled)
- [ ] Newsletter signup works
- [ ] Reminder scheduling works
- [ ] Analytics tracking works

## 🎉 You're Done!

All features are now set up and ready to use!

**Need more details?** See:

- `docs/ANALYTICS_SETUP.md` - Detailed GA setup
- `docs/DATABASE_MIGRATIONS.md` - Database setup
- `docs/CRON_JOB_SETUP.md` - Cron job options
- `docs/FEATURE_TESTING.md` - Testing guide
