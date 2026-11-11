import { NextResponse } from 'next/server'
import { timingSafeCompare } from '@/lib/admin-auth'
import { enqueueBookingEmail, processEmailQueue, type EmailTemplateKey } from '@/lib/email'
import { query } from '@/lib/db'

const templates: EmailTemplateKey[] = [
  'booking_received',
  'booking_confirmed',
  'payment_completed',
  'payment_failed',
  'booking_cancelled',
  'checkin_reminder',
]

function isCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization') || ''
  if (!secret || !authHeader) return false
  return timingSafeCompare(authHeader, `Bearer ${secret}`)
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function getTemplate(value: string | null): EmailTemplateKey {
  if (value && templates.includes(value as EmailTemplateKey)) {
    return value as EmailTemplateKey
  }
  return 'payment_completed'
}

export async function GET(request: Request) {
  if (!isCronRequest(request)) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const recipientEmail = searchParams.get('to') || process.env.BREVO_SENDER_EMAIL || ''
  const recipientName = searchParams.get('name') || 'Alessio Test'
  const templateKey = getTemplate(searchParams.get('template'))

  if (!isEmail(recipientEmail)) {
    return NextResponse.json(
      { error: 'Destinatario non valido. Usa ?to=email@example.com' },
      { status: 400 }
    )
  }

  const now = new Date()
  const checkIn = new Date(now)
  checkIn.setDate(now.getDate() + 14)
  const checkOut = new Date(checkIn)
  checkOut.setDate(checkIn.getDate() + 2)

  const bookingNumber = `TEST-${now.getTime().toString().slice(-10)}`
  const job = await enqueueBookingEmail(
    {
      bookingNumber,
      guestName: recipientName,
      guestEmail: recipientEmail,
      checkIn: checkIn.toISOString().slice(0, 10),
      checkOut: checkOut.toISOString().slice(0, 10),
      roomType: 'Camera Deluxe',
      guestsCount: 2,
      totalAmount: 240,
      specialRequests: 'Email di test generata manualmente. Nessuna prenotazione reale.',
    },
    templateKey
  )

  const result = await processEmailQueue(1)
  const status = await query(
    `SELECT id, template_key, recipient_email, subject, status, attempts, last_error, brevo_message_id, sent_at
     FROM email_queue
     WHERE id = $1`,
    [job.id]
  )

  return NextResponse.json({
    success: status.rows[0]?.status === 'sent',
    bookingNumber,
    queue: status.rows[0],
    result,
  })
}
