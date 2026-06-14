import { query } from './db'
import { fullAddress, getSiteSettings } from './site-settings'

export type EmailTemplateKey =
  | 'booking_received'
  | 'booking_confirmed'
  | 'payment_completed'
  | 'payment_failed'
  | 'booking_cancelled'
  | 'checkin_reminder'

interface BookingEmailPayload {
  bookingNumber: string
  guestName: string
  guestEmail: string
  checkIn: string
  checkOut: string
  roomType: string
  guestsCount: number
  totalAmount: number | string
  specialRequests?: string | null
}

interface QueueEmailInput {
  bookingId?: number | null
  bookingNumber?: string | null
  templateKey: EmailTemplateKey
  recipientEmail: string
  recipientName?: string | null
  payload: Record<string, unknown>
}

interface EmailQueueRow {
  id: number
  booking_id: number | null
  booking_number: string | null
  template_key: EmailTemplateKey
  recipient_email: string
  recipient_name: string | null
  subject: string
  payload: Record<string, unknown>
  attempts: number
  max_attempts: number
}

interface BrevoSendResult {
  messageId?: string
  [key: string]: unknown
}

function getBrevoApiKey(): string {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    throw new Error('BREVO_API_KEY is not configured')
  }
  return apiKey
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function getBookingPayload(payload: Record<string, unknown>): BookingEmailPayload {
  return {
    bookingNumber: String(payload.bookingNumber || ''),
    guestName: String(payload.guestName || ''),
    guestEmail: String(payload.guestEmail || ''),
    checkIn: String(payload.checkIn || ''),
    checkOut: String(payload.checkOut || ''),
    roomType: String(payload.roomType || ''),
    guestsCount: Number(payload.guestsCount || 0),
    totalAmount: payload.totalAmount as number | string,
    specialRequests: payload.specialRequests ? String(payload.specialRequests) : null,
  }
}

function getTemplateMeta(templateKey: EmailTemplateKey, payload: Record<string, unknown>) {
  const bookingNumber = String(payload.bookingNumber || '').trim()
  const suffix = bookingNumber ? ` - ${bookingNumber}` : ''

  switch (templateKey) {
    case 'booking_received':
      return {
        heading: 'Booking received',
        intro: 'We have received your booking request.',
        subject: `Booking received${suffix}`,
      }
    case 'booking_confirmed':
      return {
        heading: 'Booking confirmed',
        intro: 'Your booking has been confirmed.',
        subject: `Booking confirmed${suffix}`,
      }
    case 'payment_completed':
      return {
        heading: 'Payment completed',
        intro: 'Your payment was completed and your booking is confirmed.',
        subject: `Payment completed${suffix}`,
      }
    case 'payment_failed':
      return {
        heading: 'Payment failed',
        intro: 'We could not complete your payment. Please contact us if you need assistance.',
        subject: `Payment failed${suffix}`,
      }
    case 'booking_cancelled':
      return {
        heading: 'Booking cancelled',
        intro: 'Your booking has been cancelled.',
        subject: `Booking cancelled${suffix}`,
      }
    case 'checkin_reminder':
      return {
        heading: 'Check-in reminder',
        intro: 'Your stay is coming up. Here are your booking details.',
        subject: `Check-in reminder${suffix}`,
      }
  }
}

async function renderEmailHtml(templateKey: EmailTemplateKey, payload: Record<string, unknown>) {
  const settings = await getSiteSettings()
  const booking = getBookingPayload(payload)
  const meta = getTemplateMeta(templateKey, payload)
  const checkInDate = formatDate(booking.checkIn)
  const checkOutDate = formatDate(booking.checkOut)
  const websiteLabel = settings.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
  const total = Number(booking.totalAmount || 0).toFixed(2)

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">${escapeHtml(settings.shortName)}</h1>
        <p style="color: #e0e7ff; margin: 10px 0 0 0;">${escapeHtml(settings.tagline)}</p>
      </div>

      <div style="padding: 30px; background: #ffffff;">
        <h2 style="color: #1d4ed8; margin: 0 0 20px 0;">${escapeHtml(meta.heading)}</h2>

        <p>Dear ${escapeHtml(booking.guestName)},</p>
        <p>${escapeHtml(meta.intro)}</p>

        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1d4ed8;">Booking Details</h3>
          <p><strong>Booking Number:</strong> ${escapeHtml(booking.bookingNumber)}</p>
          <p><strong>Guest Name:</strong> ${escapeHtml(booking.guestName)}</p>
          <p><strong>Check-in:</strong> ${checkInDate}</p>
          <p><strong>Check-out:</strong> ${checkOutDate}</p>
          <p><strong>Room Type:</strong> ${escapeHtml(booking.roomType)}</p>
          <p><strong>Guests:</strong> ${escapeHtml(booking.guestsCount)}</p>
          <p><strong>Total Amount:</strong> &euro;${escapeHtml(total)}</p>
          <p style="color: #d97706; font-size: 14px; margin-top: 10px;">
            <strong>Tourist Tax:</strong> &euro;1 per person per night to be paid on-site (cash only)
          </p>
          ${booking.specialRequests ? `<p><strong>Special Requests:</strong> ${escapeHtml(booking.specialRequests)}</p>` : ''}
        </div>

        <div style="background: #fef7ed; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #d97706;">Check-in & Check-out Instructions</h3>
          <p style="margin: 10px 0;"><strong>Check-in:</strong> Available from <strong>${escapeHtml(settings.checkInTime)}</strong></p>
          <p style="margin: 10px 0;"><strong>Check-out:</strong> By <strong>${escapeHtml(settings.checkOutTime)}</strong></p>
          <p style="margin: 15px 0 10px 0; padding: 15px; background: #fff; border-radius: 6px; color: #92400e;">
            <strong>Important:</strong> Please respect these times. If you need to arrive outside check-in hours or require a late check-out, please contact us in advance via <a href="${escapeHtml(settings.whatsappUrl)}" style="color: #d97706;">WhatsApp</a> or <a href="mailto:${escapeHtml(settings.email)}" style="color: #d97706;">email</a>.
          </p>
        </div>

        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #0369a1;">Property Information</h3>
          <p><strong>Address:</strong> ${escapeHtml(fullAddress(settings))}</p>
          <p><strong>Airport Distance:</strong> ${escapeHtml(settings.airportDistanceLabel)}</p>
          <p><strong>WhatsApp:</strong> <a href="${escapeHtml(settings.whatsappUrl)}" style="color: #0369a1;">${escapeHtml(settings.phoneDisplay)}</a></p>
          <p><strong>Email:</strong> <a href="mailto:${escapeHtml(settings.email)}" style="color: #0369a1;">${escapeHtml(settings.email)}</a></p>
        </div>

        <p style="margin-top: 30px;">We look forward to welcoming you to Sicily.</p>
        <p style="color: #6b7280; font-size: 14px;">If you have any questions, please contact us.</p>

        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; margin: 5px 0;">${escapeHtml(settings.businessName)}</p>
          <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">${escapeHtml(settings.city)}, Sicily - ${escapeHtml(websiteLabel)}</p>
        </div>
      </div>
    </div>
  `
}

async function sendBrevoEmail(job: EmailQueueRow): Promise<BrevoSendResult> {
  const settings = await getSiteSettings()
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'prenotazioni@aurooms.it'
  const senderName = process.env.BREVO_SENDER_NAME || settings.shortName
  const htmlContent = await renderEmailHtml(job.template_key, job.payload)

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': getBrevoApiKey(),
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to: [
        {
          email: job.recipient_email,
          name: job.recipient_name || undefined,
        },
      ],
      subject: job.subject,
      htmlContent,
      tags: [job.template_key],
      params: job.payload,
    }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = typeof data?.message === 'string' ? data.message : `Brevo API error ${response.status}`
    throw new Error(message)
  }

  return data
}

export async function enqueueEmailJob(input: QueueEmailInput) {
  const meta = getTemplateMeta(input.templateKey, input.payload)
  const result = await query(
    `INSERT INTO email_queue (
       booking_id, booking_number, template_key, recipient_email, recipient_name,
       subject, payload, status, scheduled_at, created_at, updated_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     RETURNING *`,
    [
      input.bookingId || null,
      input.bookingNumber || null,
      input.templateKey,
      input.recipientEmail,
      input.recipientName || null,
      meta.subject,
      JSON.stringify(input.payload),
    ]
  )

  return result.rows[0]
}

export async function enqueueBookingEmail(
  booking: BookingEmailPayload & { bookingId?: number | null },
  templateKey: EmailTemplateKey = 'payment_completed'
) {
  return enqueueEmailJob({
    bookingId: booking.bookingId || null,
    bookingNumber: booking.bookingNumber,
    templateKey,
    recipientEmail: booking.guestEmail,
    recipientName: booking.guestName,
    payload: booking as unknown as Record<string, unknown>,
  })
}

export async function processEmailQueue(limit = 5) {
  const result = await query(
    `SELECT *
     FROM email_queue
     WHERE status IN ('pending', 'failed')
       AND attempts < max_attempts
       AND scheduled_at <= CURRENT_TIMESTAMP
     ORDER BY scheduled_at ASC, created_at ASC
     LIMIT $1`,
    [limit]
  )

  let sent = 0
  let failed = 0

  for (const job of result.rows as EmailQueueRow[]) {
    const attempts = Number(job.attempts) + 1

    await query(
      `UPDATE email_queue
       SET status = 'processing', attempts = attempts + 1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [job.id]
    )

    try {
      const data = await sendBrevoEmail(job)
      await query(
        `UPDATE email_queue
         SET status = 'sent',
             brevo_message_id = $2,
             last_error = NULL,
             sent_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [job.id, data.messageId || null]
      )
      sent++
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown email error'
      const nextStatus = attempts >= Number(job.max_attempts) ? 'failed' : 'pending'
      const retryMinutes = Math.min(60, attempts * attempts * 5)

      await query(
        `UPDATE email_queue
         SET status = $2,
             last_error = $3,
             scheduled_at = CURRENT_TIMESTAMP + ($4 || ' minutes')::interval,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [job.id, nextStatus, message.slice(0, 1000), retryMinutes]
      )
      failed++
    }
  }

  return { processed: result.rows.length, sent, failed }
}

export async function sendBookingConfirmation(booking: BookingEmailPayload) {
  const job = await enqueueBookingEmail(booking, 'payment_completed')
  return processEmailQueue(job ? 1 : 0)
}

export async function recordBrevoEvent(payload: Record<string, unknown>) {
  const messageId = String(payload['message-id'] || payload.messageId || payload.message_id || '')
  const eventType = String(payload.event || payload.type || 'unknown')
  const recipientEmail = String(payload.email || payload.recipient || '')
  const bookingNumber = String(payload.bookingNumber || payload.booking_number || '')
  const eventDate = payload.date || payload.ts || payload.timestamp

  const queueResult = messageId
    ? await query('SELECT id, booking_id, booking_number FROM email_queue WHERE brevo_message_id = $1 LIMIT 1', [messageId])
    : { rows: [] }

  const queueRow = queueResult.rows[0]

  await query(
    `INSERT INTO email_events (
       email_queue_id, booking_id, booking_number, provider_message_id,
       event_type, recipient_email, payload, occurred_at, created_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, CURRENT_TIMESTAMP)`,
    [
      queueRow?.id || null,
      queueRow?.booking_id || null,
      queueRow?.booking_number || bookingNumber || null,
      messageId || null,
      eventType,
      recipientEmail || null,
      JSON.stringify(payload),
      eventDate ? new Date(String(eventDate)) : null,
    ]
  )
}
