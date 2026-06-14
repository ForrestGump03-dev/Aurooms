-- Migration: admin-managed rooms metadata and singleton site settings
-- Additive only: preserves existing rooms and bookings.

ALTER TABLE rooms
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  business_name VARCHAR(120) NOT NULL DEFAULT 'AuRooms Guest House',
  short_name VARCHAR(60) NOT NULL DEFAULT 'AuRooms',
  tagline VARCHAR(180) NOT NULL DEFAULT 'Luxury Guest House - Cinisi, Sicily',
  description TEXT NOT NULL DEFAULT 'Experience authentic Sicilian luxury just 3km from Palermo Airport. Your perfect gateway to discovering the beauty of Sicily.',
  address_line VARCHAR(180) NOT NULL DEFAULT 'Piazza Pietro Venuti, 12',
  postal_code VARCHAR(20) NOT NULL DEFAULT '90045',
  city VARCHAR(80) NOT NULL DEFAULT 'Cinisi',
  province VARCHAR(40) NOT NULL DEFAULT 'PA',
  country VARCHAR(80) NOT NULL DEFAULT 'Italy',
  phone_display VARCHAR(50) NOT NULL DEFAULT '+39 375 884 3175',
  phone_href VARCHAR(50) NOT NULL DEFAULT '+393758843175',
  whatsapp_number VARCHAR(50) NOT NULL DEFAULT '393758843175',
  whatsapp_url VARCHAR(500) NOT NULL DEFAULT 'https://wa.me/393758843175',
  email VARCHAR(120) NOT NULL DEFAULT 'info@aurooms.it',
  maps_url VARCHAR(500) NOT NULL DEFAULT 'https://maps.app.goo.gl/GyEnYbbnxYT872uA9',
  airport_distance_label VARCHAR(120) NOT NULL DEFAULT '3km from Palermo Airport',
  website_url VARCHAR(200) NOT NULL DEFAULT 'https://aurooms.it',
  instagram_url VARCHAR(200),
  facebook_url VARCHAR(200),
  check_in_time VARCHAR(5) NOT NULL DEFAULT '15:00',
  check_out_time VARCHAR(5) NOT NULL DEFAULT '11:00',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO site_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;
