# Database Migrations Setup Guide

This guide will help you run the new Supabase migrations for newsletter subscribers and court reminders.

## Prerequisites

- Supabase account and project created
- Access to Supabase Dashboard or Supabase CLI

## Option 1: Using Supabase Dashboard (Recommended for Beginners)

### Step 1: Access SQL Editor

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in the left sidebar

### Step 2: Run Newsletter Table Migration

1. Open `supabase/migrations/002_create_newsletter_table.sql`
2. Copy the entire contents
3. Paste into SQL Editor
4. Click **Run** (or press `Cmd+Enter` / `Ctrl+Enter`)
5. Verify success message appears

### Step 3: Run Court Reminders Table Migration

1. Open `supabase/migrations/003_create_court_reminders_table.sql`
2. Copy the entire contents
3. Paste into SQL Editor
4. Click **Run**
5. Verify success message appears

### Step 4: Verify Tables Created

1. Go to **Table Editor** in Supabase Dashboard
2. You should see two new tables:
   - `newsletter_subscribers`
   - `court_reminders`
3. Click on each table to verify the structure

## Option 2: Using Supabase CLI (Recommended for Developers)

### Step 1: Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Or using npm
npm install -g supabase
```

### Step 2: Login to Supabase

```bash
supabase login
```

### Step 3: Link Your Project

```bash
supabase link --project-ref your-project-ref
```

You can find your project ref in the Supabase Dashboard URL:
`https://supabase.com/dashboard/project/your-project-ref`

### Step 4: Run Migrations

```bash
# Run all pending migrations
supabase db push

# Or run specific migration
supabase migration up
```

### Step 5: Verify

```bash
# List all tables
supabase db diff

# Check migration status
supabase migration list
```

## Option 3: Manual SQL Execution

If you prefer to run SQL directly:

### Newsletter Subscribers Table

```sql
-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);

-- Create index on subscribed_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_subscribed_at ON newsletter_subscribers(subscribed_at);
```

### Court Reminders Table

```sql
-- Create court_reminders table for automated email reminders
CREATE TABLE IF NOT EXISTS court_reminders (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  reminder_date TIMESTAMP WITH TIME ZONE NOT NULL,
  summary TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Create index on reminder_date for efficient querying of pending reminders
CREATE INDEX IF NOT EXISTS idx_court_reminders_reminder_date ON court_reminders(reminder_date);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_court_reminders_status ON court_reminders(status);

-- Create index on email for user-specific queries
CREATE INDEX IF NOT EXISTS idx_court_reminders_email ON court_reminders(email);

-- Create composite index for efficient pending reminders query
CREATE INDEX IF NOT EXISTS idx_court_reminders_pending ON court_reminders(status, reminder_date) WHERE status = 'pending';
```

## Verify Tables Are Created

Run this query in SQL Editor to verify:

```sql
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('newsletter_subscribers', 'court_reminders')
ORDER BY table_name, ordinal_position;
```

You should see all columns for both tables.

## Test the Tables

### Test Newsletter Subscription

```sql
-- Insert a test subscriber
INSERT INTO newsletter_subscribers (email, source)
VALUES ('test@example.com', 'test');

-- Verify it was inserted
SELECT * FROM newsletter_subscribers WHERE email = 'test@example.com';

-- Clean up test data
DELETE FROM newsletter_subscribers WHERE email = 'test@example.com';
```

### Test Court Reminder

```sql
-- Insert a test reminder
INSERT INTO court_reminders (email, reminder_date, summary, status)
VALUES (
  'test@example.com',
  NOW() + INTERVAL '1 hour',
  'Test reminder',
  'pending'
);

-- Verify it was inserted
SELECT * FROM court_reminders WHERE email = 'test@example.com';

-- Clean up test data
DELETE FROM court_reminders WHERE email = 'test@example.com';
```

## Troubleshooting

### Error: "relation already exists"

If you see this error, the table already exists. You can:

1. Skip this migration (it's safe)
2. Or drop and recreate (⚠️ will delete data):

```sql
DROP TABLE IF EXISTS newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS court_reminders CASCADE;
```

Then re-run the migrations.

### Error: "permission denied"

Make sure you're using the **service_role** key, not the anon key. The service_role key has full database access.

### Error: "column does not exist"

If you see this, the migration didn't run completely. Check the table structure and re-run the migration.

---

**Next Step**: Set up cron job → See `CRON_JOB_SETUP.md`
