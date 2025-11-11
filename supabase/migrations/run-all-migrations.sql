-- ========================================
-- CUSTODY CLARITY DATABASE MIGRATIONS
-- ========================================
-- This file consolidates all database migrations for easy execution.
-- Run this in your Supabase SQL Editor to set up all required tables.
-- All migrations use IF NOT EXISTS for idempotency (safe to run multiple times).
-- ========================================

-- ========================================
-- MIGRATION 001: Queue Records Table
-- ========================================
-- Stores service queue tracking information
CREATE TABLE IF NOT EXISTS queue_records (
  id BIGSERIAL PRIMARY KEY,
  service_id TEXT NOT NULL,
  wait_minutes INTEGER NOT NULL,
  suggested_window TEXT,
  submitted_at BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_queue_records_service_id ON queue_records(service_id);
CREATE INDEX IF NOT EXISTS idx_queue_records_submitted_at ON queue_records(submitted_at);

-- ========================================
-- MIGRATION 002: Newsletter Subscribers Table
-- ========================================
-- Stores email newsletter subscriptions
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_subscribed_at ON newsletter_subscribers(subscribed_at);

-- ========================================
-- MIGRATION 003: Court Reminders Table
-- ========================================
-- Stores scheduled court filing reminders for automated email delivery
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

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_court_reminders_reminder_date ON court_reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_court_reminders_status ON court_reminders(status);
CREATE INDEX IF NOT EXISTS idx_court_reminders_email ON court_reminders(email);

-- Composite index for optimized pending reminders cron job query
CREATE INDEX IF NOT EXISTS idx_court_reminders_pending ON court_reminders(status, reminder_date) WHERE status = 'pending';

-- ========================================
-- MIGRATION 004: Referrals Table
-- ========================================
-- Tracks UTM parameters and referral codes for marketing attribution
CREATE TABLE IF NOT EXISTS referrals (
  id BIGSERIAL PRIMARY KEY,
  code TEXT,
  source TEXT,
  medium TEXT,
  campaign TEXT,
  content TEXT,
  term TEXT,
  partner TEXT,
  landing_path TEXT NOT NULL,
  referrer_url TEXT,
  visitor_id TEXT NOT NULL,
  user_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_referrals_visitor ON referrals(visitor_id);
CREATE INDEX IF NOT EXISTS idx_referrals_campaign ON referrals(campaign);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(code);

-- ========================================
-- MIGRATION COMPLETE
-- ========================================
-- All tables and indexes have been created successfully.
-- You can verify the migrations by running the verification queries.
-- ========================================
