-- Migration: add maintenance mode and custom maintenance message to site_settings
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS maintenance_message TEXT DEFAULT NULL;
