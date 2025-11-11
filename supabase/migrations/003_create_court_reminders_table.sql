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



