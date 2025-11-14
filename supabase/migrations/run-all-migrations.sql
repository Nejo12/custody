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
-- MIGRATION 005: Planning Progress Table
-- ========================================
-- Stores user progress through planning checklists
CREATE TABLE IF NOT EXISTS planning_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  email TEXT,
  checklist_id TEXT NOT NULL UNIQUE,
  completed_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  progress_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_planning_progress_user_id ON planning_progress(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_planning_progress_email ON planning_progress(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_planning_progress_checklist_id ON planning_progress(checklist_id);
CREATE INDEX IF NOT EXISTS idx_planning_progress_last_updated ON planning_progress(last_updated);

-- ========================================
-- MIGRATION 006: Planning Reminders Table
-- ========================================
-- Stores scheduled reminders for planning checklist items
CREATE TABLE IF NOT EXISTS planning_reminders (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  checklist_id TEXT,
  item_id TEXT NOT NULL,
  reminder_date TIMESTAMP WITH TIME ZONE NOT NULL,
  summary TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_planning_reminders_reminder_date ON planning_reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_planning_reminders_status ON planning_reminders(status);
CREATE INDEX IF NOT EXISTS idx_planning_reminders_email ON planning_reminders(email);
CREATE INDEX IF NOT EXISTS idx_planning_reminders_checklist_id ON planning_reminders(checklist_id) WHERE checklist_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_planning_reminders_item_id ON planning_reminders(item_id);
CREATE INDEX IF NOT EXISTS idx_planning_reminders_pending ON planning_reminders(status, reminder_date) WHERE status = 'pending';

-- ========================================
-- MIGRATION 007: City Resources Table
-- ========================================
-- Stores city-specific resources (Standesamt, Jugendamt) for planning feature
-- Enable pg_trgm extension first (required for fuzzy text search)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS city_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  postcode TEXT NOT NULL,
  standesamt JSONB NOT NULL,
  jugendamt JSONB NOT NULL,
  notes TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(city, postcode)
);

CREATE INDEX IF NOT EXISTS idx_city_resources_city ON city_resources(city);
CREATE INDEX IF NOT EXISTS idx_city_resources_postcode ON city_resources(postcode);
CREATE INDEX IF NOT EXISTS idx_city_resources_city_postcode ON city_resources(city, postcode);
-- Create full-text search index (requires pg_trgm extension enabled above)
CREATE INDEX IF NOT EXISTS idx_city_resources_city_trgm ON city_resources USING gin(city gin_trgm_ops);

-- ========================================
-- MIGRATION 008 & 009: Seed City Resources
-- ========================================
-- Note: Full city data seeding is in separate migration files
-- (008_migrate_city_resources.sql and 009_add_more_cities.sql)
-- Run those files separately or include their INSERT statements here

-- ========================================
-- MIGRATION COMPLETE
-- ========================================
-- All tables and indexes have been created successfully.
-- You can verify the migrations by running the verification queries.
-- Note: City resources data should be seeded using migrations 008 and 009.
-- ========================================
