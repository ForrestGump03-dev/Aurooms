-- Migration: Add push_subscriptions table for Web Push notifications
-- Created: 2025-10-11

-- Create push_subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id SERIAL PRIMARY KEY,
  endpoint TEXT UNIQUE NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_created ON push_subscriptions(created_at DESC);

-- Add comment
COMMENT ON TABLE push_subscriptions IS 'Stores Web Push API subscriptions for admin dashboard notifications';
COMMENT ON COLUMN push_subscriptions.endpoint IS 'Unique push subscription endpoint URL from browser';
COMMENT ON COLUMN push_subscriptions.p256dh_key IS 'Public key for encrypting push messages';
COMMENT ON COLUMN push_subscriptions.auth_key IS 'Authentication secret for push messages';
COMMENT ON COLUMN push_subscriptions.user_agent IS 'Browser/device identifier';
