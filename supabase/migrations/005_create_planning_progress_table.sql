-- ========================================
-- MIGRATION 005: Planning Progress Table
-- ========================================
-- Stores user progress through planning checklists
-- Supports both authenticated users (user_id) and anonymous users (email)
-- ========================================

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

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_planning_progress_user_id ON planning_progress(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_planning_progress_email ON planning_progress(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_planning_progress_checklist_id ON planning_progress(checklist_id);
CREATE INDEX IF NOT EXISTS idx_planning_progress_last_updated ON planning_progress(last_updated);

-- Add comment to table
COMMENT ON TABLE planning_progress IS 'Stores user progress through planning checklists. Supports both authenticated (user_id) and anonymous (email) users.';

