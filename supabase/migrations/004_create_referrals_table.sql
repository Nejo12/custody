-- Lightweight referral/UTM capture table
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

CREATE INDEX IF NOT EXISTS idx_referrals_visitor ON referrals(visitor_id);
CREATE INDEX IF NOT EXISTS idx_referrals_campaign ON referrals(campaign);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(code);

