-- ========================================
-- MIGRATION 006: Planning Reminders Table
-- ========================================
-- Stores scheduled reminders for planning checklist items
-- Extends the court_reminders pattern for planning-specific reminders
-- ========================================

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

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_planning_reminders_reminder_date ON planning_reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_planning_reminders_status ON planning_reminders(status);
CREATE INDEX IF NOT EXISTS idx_planning_reminders_email ON planning_reminders(email);
CREATE INDEX IF NOT EXISTS idx_planning_reminders_checklist_id ON planning_reminders(checklist_id) WHERE checklist_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_planning_reminders_item_id ON planning_reminders(item_id);

-- Create composite index for efficient pending reminders query
CREATE INDEX IF NOT EXISTS idx_planning_reminders_pending ON planning_reminders(status, reminder_date) WHERE status = 'pending';

-- Add comment to table
COMMENT ON TABLE planning_reminders IS 'Stores scheduled reminders for planning checklist items. Used for email notifications about upcoming deadlines.';

