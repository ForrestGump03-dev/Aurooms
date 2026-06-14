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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
