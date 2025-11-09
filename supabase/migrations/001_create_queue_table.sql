-- Create queue_records table
CREATE TABLE IF NOT EXISTS queue_records (
  id BIGSERIAL PRIMARY KEY,
  service_id TEXT NOT NULL,
  wait_minutes INTEGER NOT NULL,
  suggested_window TEXT,
  submitted_at BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on service_id for faster queries
CREATE INDEX IF NOT EXISTS idx_queue_records_service_id ON queue_records(service_id);

-- Create index on submitted_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_queue_records_submitted_at ON queue_records(submitted_at);

