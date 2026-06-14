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
