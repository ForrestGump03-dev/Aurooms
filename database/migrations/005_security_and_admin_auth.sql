-- Migration 005: Bidirectional maintenance tracking, Admin credentials & reset tokens, Persistent rate limits, and Pending booking status default

-- 1. Track last seen MAINTENANCE_MODE env value for "last update wins" sync
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS last_seen_env_maintenance VARCHAR(10) DEFAULT NULL;

-- 2. Singleton admin_credentials table for hashed password, session revocation, and email password reset
CREATE TABLE IF NOT EXISTS admin_credentials (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  password_hash TEXT DEFAULT NULL,
  session_version INTEGER NOT NULL DEFAULT 1,
  reset_token_hash TEXT DEFAULT NULL,
  reset_token_expires_at TIMESTAMP DEFAULT NULL,
  password_updated_at TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO admin_credentials (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- 3. Persistent rate limiting table for Serverless environments
CREATE TABLE IF NOT EXISTS rate_limits (
  key VARCHAR(150) PRIMARY KEY,
  attempts INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  blocked_until TIMESTAMP DEFAULT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_updated_at ON rate_limits(updated_at);

-- 4. Ensure new checkout bookings start as 'pending' until payment is confirmed
ALTER TABLE bookings ALTER COLUMN booking_status SET DEFAULT 'pending';

