-- ========================================
-- CUSTODY CLARITY DATABASE VERIFICATION
-- ========================================
-- Run these queries in your Supabase SQL Editor to verify that all migrations completed successfully.
-- ========================================

-- ========================================
-- CHECK 1: Verify all tables exist
-- ========================================
SELECT
  table_name,
  CASE
    WHEN table_name IN ('queue_records', 'newsletter_subscribers', 'court_reminders', 'referrals')
    THEN '✓ Exists'
    ELSE '✗ Missing'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('queue_records', 'newsletter_subscribers', 'court_reminders', 'referrals')
ORDER BY table_name;

-- Expected output: 4 tables with '✓ Exists' status

-- ========================================
-- CHECK 2: Verify table structures
-- ========================================

-- Queue Records table structure
SELECT
  'queue_records' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'queue_records'
ORDER BY ordinal_position;

-- Newsletter Subscribers table structure
SELECT
  'newsletter_subscribers' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'newsletter_subscribers'
ORDER BY ordinal_position;

-- Court Reminders table structure
SELECT
  'court_reminders' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'court_reminders'
ORDER BY ordinal_position;

-- Referrals table structure
SELECT
  'referrals' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'referrals'
ORDER BY ordinal_position;

-- ========================================
-- CHECK 3: Verify indexes
-- ========================================
SELECT
  tablename,
  indexname,
  '✓ Index exists' as status
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('queue_records', 'newsletter_subscribers', 'court_reminders', 'referrals')
ORDER BY tablename, indexname;

-- Expected indexes:
-- queue_records: idx_queue_records_service_id, idx_queue_records_submitted_at
-- newsletter_subscribers: idx_newsletter_subscribers_email, idx_newsletter_subscribers_subscribed_at
-- court_reminders: idx_court_reminders_reminder_date, idx_court_reminders_status, idx_court_reminders_email, idx_court_reminders_pending
-- referrals: idx_referrals_visitor, idx_referrals_campaign, idx_referrals_code

-- ========================================
-- CHECK 4: Verify constraints
-- ========================================
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  '✓ Constraint exists' as status
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
  AND tc.table_name IN ('queue_records', 'newsletter_subscribers', 'court_reminders', 'referrals')
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;

-- Expected constraints:
-- Each table should have a PRIMARY KEY constraint
-- newsletter_subscribers should have a UNIQUE constraint on email
-- court_reminders should have a CHECK constraint on status

-- ========================================
-- CHECK 5: Verify row counts (should be 0 for new installations)
-- ========================================
SELECT
  'queue_records' as table_name,
  COUNT(*) as row_count
FROM queue_records
UNION ALL
SELECT
  'newsletter_subscribers' as table_name,
  COUNT(*) as row_count
FROM newsletter_subscribers
UNION ALL
SELECT
  'court_reminders' as table_name,
  COUNT(*) as row_count
FROM court_reminders
UNION ALL
SELECT
  'referrals' as table_name,
  COUNT(*) as row_count
FROM referrals;

-- ========================================
-- VERIFICATION COMPLETE
-- ========================================
-- If all checks pass, your database is correctly set up.
-- ========================================
