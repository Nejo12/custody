-- ========================================
-- MIGRATION 007: City Resources Table
-- ========================================
-- Stores city-specific resources (Standesamt, Jugendamt) for planning feature
-- Supports expansion from JSON file to scalable database
-- ========================================

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

-- Enable pg_trgm extension for fuzzy text search (must be done before creating trgm indexes)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_city_resources_city ON city_resources(city);
CREATE INDEX IF NOT EXISTS idx_city_resources_postcode ON city_resources(postcode);
CREATE INDEX IF NOT EXISTS idx_city_resources_city_postcode ON city_resources(city, postcode);

-- Create full-text search index for city name search (requires pg_trgm extension)
CREATE INDEX IF NOT EXISTS idx_city_resources_city_trgm ON city_resources USING gin(city gin_trgm_ops);

-- Add comment to table
COMMENT ON TABLE city_resources IS 'Stores city-specific resources (Standesamt, Jugendamt) for planning feature. Supports search and expansion beyond initial JSON data.';

