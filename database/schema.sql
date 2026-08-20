-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  booking_number VARCHAR(20) UNIQUE NOT NULL,
  guest_name VARCHAR(100) NOT NULL,
  guest_email VARCHAR(100) NOT NULL,
  guest_phone VARCHAR(20),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests_count INTEGER NOT NULL,
  room_type VARCHAR(50) NOT NULL,
  room_id INTEGER REFERENCES rooms(id),
  total_amount DECIMAL(10,2) NOT NULL,
  stripe_payment_intent_id VARCHAR(100),
  payment_status VARCHAR(20) DEFAULT 'pending',
  booking_status VARCHAR(20) DEFAULT 'confirmed',
  special_requests TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  price_per_night DECIMAL(8,2) NOT NULL,
  max_guests INTEGER NOT NULL,
  size VARCHAR(20),
  bed_type VARCHAR(50),
  amenities TEXT[],
  image_urls TEXT[],
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create singleton site settings table
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
  maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
  maintenance_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO site_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(guest_email);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(type);
CREATE INDEX IF NOT EXISTS idx_rooms_available ON rooms(available);

-- Lightweight transactional email queue
CREATE TABLE IF NOT EXISTS email_queue (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
  booking_number VARCHAR(20),
  template_key VARCHAR(50) NOT NULL,
  recipient_email VARCHAR(120) NOT NULL,
  recipient_name VARCHAR(120),
  subject VARCHAR(200) NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  brevo_message_id VARCHAR(200),
  last_error TEXT,
  scheduled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT email_queue_status_check CHECK (status IN ('pending', 'processing', 'sent', 'failed'))
);

CREATE TABLE IF NOT EXISTS email_events (
  id SERIAL PRIMARY KEY,
  email_queue_id INTEGER REFERENCES email_queue(id) ON DELETE SET NULL,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
  booking_number VARCHAR(20),
  provider_message_id VARCHAR(200),
  event_type VARCHAR(50) NOT NULL,
  recipient_email VARCHAR(120),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_queue_status_scheduled ON email_queue(status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_booking_id ON email_queue(booking_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_brevo_message_id ON email_queue(brevo_message_id);
CREATE INDEX IF NOT EXISTS idx_email_events_message_id ON email_events(provider_message_id);
CREATE INDEX IF NOT EXISTS idx_email_events_booking_id ON email_events(booking_id);
