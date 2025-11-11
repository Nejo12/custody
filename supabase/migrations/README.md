# Database Migrations

This directory contains all database migrations for Custody Clarity.

## Quick Start

### Option 1: Run All Migrations at Once (Recommended)

1. Go to your Supabase project: https://supabase.com/dashboard
2. Select your project: `custodyclarity`
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `run-all-migrations.sql`
6. Paste into the SQL editor
7. Click **Run** or press `Cmd/Ctrl + Enter`

### Option 2: Run Individual Migrations

If you prefer to run migrations one at a time:

1. Run `001_create_queue_table.sql`
2. Run `002_create_newsletter_table.sql`
3. Run `003_create_court_reminders_table.sql`
4. Run `004_create_referrals_table.sql`

## Verify Migrations

After running migrations, verify they completed successfully:

1. In the Supabase SQL Editor, create a new query
2. Copy the contents of `verify-migrations.sql`
3. Run each section to verify:
   - All 4 tables exist
   - Table structures are correct
   - All indexes are created
   - Constraints are in place

## Migration Files

| File                                   | Description                                              |
| -------------------------------------- | -------------------------------------------------------- |
| `001_create_queue_table.sql`           | Creates `queue_records` table for service queue tracking |
| `002_create_newsletter_table.sql`      | Creates `newsletter_subscribers` table for email list    |
| `003_create_court_reminders_table.sql` | Creates `court_reminders` table for automated reminders  |
| `004_create_referrals_table.sql`       | Creates `referrals` table for UTM/referral tracking      |
| `run-all-migrations.sql`               | Consolidated script to run all migrations at once        |
| `verify-migrations.sql`                | Verification queries to check migration success          |

## Tables Created

### 1. queue_records

Stores service queue tracking information.

**Columns:**

- `id` - Primary key
- `service_id` - Service identifier
- `wait_minutes` - Estimated wait time
- `suggested_window` - Suggested time window
- `submitted_at` - Submission timestamp (Unix epoch)
- `created_at` - Record creation timestamp

### 2. newsletter_subscribers

Stores email newsletter subscriptions.

**Columns:**

- `id` - Primary key
- `email` - Subscriber email (unique)
- `subscribed_at` - Subscription timestamp
- `source` - Signup source
- `unsubscribed_at` - Unsubscribe timestamp (nullable)
- `created_at` - Record creation timestamp

### 3. court_reminders

Stores scheduled court filing reminders for automated email delivery.

**Columns:**

- `id` - Primary key
- `email` - Recipient email
- `reminder_date` - When to send the reminder
- `summary` - Brief summary of the reminder
- `description` - Detailed description (nullable)
- `status` - Reminder status: 'pending', 'sent', 'cancelled', or 'failed'
- `sent_at` - When the reminder was sent (nullable)
- `created_at` - Record creation timestamp
- `metadata` - Additional data in JSONB format (nullable)

### 4. referrals

Tracks UTM parameters and referral codes for marketing attribution.

**Columns:**

- `id` - Primary key
- `code` - Referral code (nullable)
- `source` - UTM source (nullable)
- `medium` - UTM medium (nullable)
- `campaign` - UTM campaign (nullable)
- `content` - UTM content (nullable)
- `term` - UTM term (nullable)
- `partner` - Partner identifier (nullable)
- `landing_path` - Landing page path
- `referrer_url` - Referrer URL (nullable)
- `visitor_id` - Anonymous visitor ID
- `user_email` - User email if known (nullable)
- `created_at` - Record creation timestamp

## Idempotency

All migrations use `IF NOT EXISTS` clauses, making them **idempotent**. This means:

- Safe to run multiple times
- Won't fail if tables already exist
- Won't duplicate data or indexes

## Troubleshooting

### Migration fails with permission error

- Ensure you're logged into the correct Supabase project
- Verify you have admin access to the project

### Table already exists error

- This shouldn't happen due to `IF NOT EXISTS` clauses
- If it does, the table was created successfully on a previous run

### Index creation fails

- Check if the index already exists using `verify-migrations.sql`
- Indexes are also created with `IF NOT EXISTS`

## Next Steps

After running migrations:

1. **Test the database connection:**

   ```bash
   # In your project root
   node -e "const {supabase} = require('./src/lib/supabase'); supabase.from('queue_records').select('count').then(console.log)"
   ```

2. **Set up the cron job** for court reminders (see `/docs/CRON_JOB_SETUP.md`)

3. **Test features that use these tables:**
   - Newsletter signup
   - Court reminder scheduling
   - Referral tracking

## Support

For issues or questions:

- Check `/docs/DATABASE_MIGRATIONS.md` for detailed setup instructions
- Review `/docs/SUPABASE_SETUP.md` for Supabase configuration
- See `/docs/FEATURE_TESTING.md` for testing procedures
