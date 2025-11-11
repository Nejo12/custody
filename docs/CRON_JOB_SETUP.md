# Cron Job Setup for Court Reminders

This guide explains how to set up automated email reminders using a cron job that calls `/api/reminders/send` periodically.

## Overview

The `/api/reminders/send` endpoint:

- Checks for reminders due within the next hour
- Sends email notifications
- Updates reminder status to "sent" or "failed"

**Recommended frequency**: Every hour (checks reminders due in next hour)

## Option 1: Netlify Scheduled Functions (Recommended for Netlify)

### Step 1: Create Scheduled Function

Create a new file: `netlify/functions/send-reminders.ts`

```typescript
import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event, context) => {
  // Verify this is a scheduled event
  if (event.source !== "netlify-scheduled-function") {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: "Unauthorized" }),
    };
  }

  const cronSecret = process.env.REMINDERS_CRON_SECRET;
  if (!cronSecret) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Cron secret not configured" }),
    };
  }

  // Call the reminders API
  const baseUrl =
    process.env.URL || process.env.NEXT_PUBLIC_APP_URL || "https://custodyclarity.com";
  const response = await fetch(`${baseUrl}/api/reminders/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cronSecret}`,
    },
  });

  const data = await response.json();

  return {
    statusCode: response.ok ? 200 : 500,
    body: JSON.stringify(data),
  };
};
```

### Step 2: Configure Schedule in netlify.toml

Add to your `netlify.toml`:

```toml
[build]
  functions = "netlify/functions"

[[plugins]]
  package = "@netlify/plugin-scheduled-functions"

[[schedules]]
  cron = "0 * * * *"  # Every hour at minute 0
  function = "send-reminders"
```

### Step 3: Install Plugin

```bash
npm install --save-dev @netlify/plugin-scheduled-functions
```

### Step 4: Set Environment Variable

In Netlify Dashboard:

- **Key**: `REMINDERS_CRON_SECRET`
- **Value**: Generate a secure random string (e.g., `openssl rand -hex 32`)

## Option 2: External Cron Service (Cron-job.org, EasyCron, etc.)

### Step 1: Get Your Cron Secret

Generate a secure token:

```bash
# Using OpenSSL
openssl rand -hex 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 2: Add to Environment Variables

In Netlify Dashboard:

- **Key**: `REMINDERS_CRON_SECRET`
- **Value**: Your generated secret

### Step 3: Configure Cron Service

#### Using cron-job.org (Free)

1. Go to [cron-job.org](https://cron-job.org/)
2. Sign up for free account
3. Click **Create cronjob**
4. Configure:
   - **Title**: `Custody Clarity Reminders`
   - **Address**: `https://custodyclarity.com/api/reminders/send`
   - **Schedule**: `0 * * * *` (every hour)
   - **Request method**: `POST`
   - **Request headers**:
     ```
     Content-Type: application/json
     Authorization: Bearer YOUR_CRON_SECRET_HERE
     ```
5. Click **Create**

#### Using EasyCron (Free tier available)

1. Go to [EasyCron](https://www.easycron.com/)
2. Sign up
3. Create new cron job:
   - **URL**: `https://custodyclarity.com/api/reminders/send`
   - **Method**: `POST`
   - **Headers**:
     ```
     Content-Type: application/json
     Authorization: Bearer YOUR_CRON_SECRET_HERE
     ```
   - **Schedule**: `0 * * * *` (every hour)
4. Save

## Option 3: GitHub Actions (Free for Public Repos)

### Step 1: Create Workflow File

Create `.github/workflows/send-reminders.yml`:

```yaml
name: Send Court Reminders

on:
  schedule:
    # Run every hour at minute 0
    - cron: "0 * * * *"
  workflow_dispatch: # Allow manual triggering

jobs:
  send-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Send Reminders
        run: |
          curl -X POST https://custodyclarity.com/api/reminders/send \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer ${{ secrets.REMINDERS_CRON_SECRET }}"
```

### Step 2: Add Secret to GitHub

1. Go to your repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `REMINDERS_CRON_SECRET`
4. Value: Your generated secret
5. Click **Add secret**

## Option 4: Vercel Cron Jobs

If you're using Vercel, add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/reminders/send",
      "schedule": "0 * * * *"
    }
  ]
}
```

And update the API route to check for Vercel cron headers.

## Testing the Cron Job

### Manual Test

```bash
# Test locally (if running dev server)
curl -X POST http://localhost:3000/api/reminders/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Test production
curl -X POST https://custodyclarity.com/api/reminders/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Expected Response

```json
{
  "success": true,
  "message": "Processed 0 reminders",
  "sent": 0,
  "failed": 0,
  "results": []
}
```

### Check Logs

- **Netlify**: Functions → Logs
- **External cron**: Check service dashboard
- **GitHub Actions**: Actions tab → Workflow runs

## Monitoring

### Set Up Alerts

Monitor for:

- Failed cron executions
- High failure rate in reminder sending
- API endpoint returning errors

### Check Reminder Status

Query Supabase to see reminder status:

```sql
SELECT
  status,
  COUNT(*) as count,
  MIN(reminder_date) as earliest,
  MAX(reminder_date) as latest
FROM court_reminders
GROUP BY status;
```

## Troubleshooting

### Cron job not running

1. Check cron service status
2. Verify environment variable is set
3. Check API endpoint is accessible
4. Review logs for errors

### Reminders not sending

1. Check `REMINDERS_CRON_SECRET` matches
2. Verify Resend API key is set
3. Check reminder dates are in the future
4. Review Supabase connection

### Too many reminders sent

The endpoint only processes reminders due within the next hour. If you have many reminders, consider:

- Running more frequently (every 15 minutes)
- Or processing in batches

---

**Next Step**: Test the features → See `FEATURE_TESTING.md`
