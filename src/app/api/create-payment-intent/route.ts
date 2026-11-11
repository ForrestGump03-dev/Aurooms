import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { query } from '@/lib/db'
import { generateBookingNumber } from '@/lib/utils'
import { getMaintenanceApiResponse, shouldBlockApiForMaintenance } from '@/lib/maintenance'
import { checkPersistentRateLimit, getClientIp } from '@/lib/rate-limit'

const PAYMENT_INTENT_RATE_LIMIT = {
  maxAttempts: 10,
  windowMs: 15 * 60 * 1000,
  blockDurationMs: 30 * 60 * 1000,
}

function calculateNightsStrict(checkIn: string, checkOut: string): number {
  const start = new Date(`${checkIn}T00:00:00Z`)
  const end = new Date(`${checkOut}T00:00:00Z`)
  const diff = end.getTime() - start.getTime()
  return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0
}

function isDateString(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

export async function POST(request: NextRequest) {
  try {
    if (await shouldBlockApiForMaintenance(request)) {
      return getMaintenanceApiResponse()
    }

    const ip = getClientIp(request)
    const rateCheck = await checkPersistentRateLimit(
      `payment-intent:${ip}`,
      PAYMENT_INTENT_RATE_LIMIT
    )
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Troppi tentativi di pagamento ravvicinati. Riprova tra qualche minuto.' },
        { status: 429 }
      )
    }

    const { booking } = await request.json()

    if (!booking || !isDateString(booking.checkIn) || !isDateString(booking.checkOut)) {
      return NextResponse.json({ error: 'Date prenotazione non valide' }, { status: 400 })
    }

    const roomId = Number.parseInt(String(booking.roomId), 10)
    const guestsCount = Number.parseInt(String(booking.guestsCount), 10)
    const nights = calculateNightsStrict(booking.checkIn, booking.checkOut)

    if (!Number.isInteger(roomId) || roomId <= 0 || !Number.isInteger(guestsCount) || guestsCount < 1 || nights < 1) {
      return NextResponse.json({ error: 'Dati prenotazione non validi' }, { status: 400 })
    }

    // Release expired unpaid holds (> 20 minutes old)
    await query(
      `UPDATE bookings
       SET booking_status = 'expired', updated_at = CURRENT_TIMESTAMP
       WHERE booking_status = 'pending'
         AND payment_status = 'pending'
         AND created_at <= CURRENT_TIMESTAMP - INTERVAL '20 minutes'`
    )

    const roomResult = await query(
      `SELECT id, name, type, price_per_night, max_guests
       FROM rooms
       WHERE id = $1 AND available = true`,
      [roomId]
    )

    if (!roomResult.rows.length) {
      return NextResponse.json({ error: 'Stanza non disponibile' }, { status: 404 })
    }

    const room = roomResult.rows[0]
    if (Number(room.max_guests) < guestsCount) {
      return NextResponse.json({ error: 'Numero ospiti superiore alla capienza della stanza' }, { status: 400 })
    }

    const overlap = await query(
      `SELECT COUNT(*) as count FROM bookings
       WHERE room_id = $1
       AND (
         booking_status = 'confirmed'
         OR (booking_status = 'pending' AND payment_status = 'pending' AND created_at > CURRENT_TIMESTAMP - INTERVAL '20 minutes')
       )
       AND (
         (check_in <= $2 AND check_out > $2) OR
         (check_in < $3 AND check_out >= $3) OR
         (check_in >= $2 AND check_out <= $3)
       )`,
      [roomId, booking.checkIn, booking.checkOut]
    )

    if (Number(overlap.rows[0].count) > 0) {
      return NextResponse.json({ error: 'Stanza non disponibile per le date selezionate' }, { status: 409 })
    }

    const subtotal = Number(room.price_per_night) * nights
    const total = subtotal + subtotal * 0.1
    const amount = Math.round(total * 100)

    const paymentIntent = await getStripe().paymentIntents.create({
      amount,
      currency: 'eur',
      metadata: {
        guestName: String(booking.guestName || ''),
        guestEmail: String(booking.guestEmail || ''),
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        roomType: room.type,
        roomId: String(room.id),
        guestsCount: String(guestsCount),
      },
    })

    const bookingNumber = generateBookingNumber()

    await query(
      `INSERT INTO bookings (
        booking_number, guest_name, guest_email, guest_phone,
        check_in, check_out, guests_count, room_type, room_id,
        total_amount, stripe_payment_intent_id, payment_status, booking_status, special_requests
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending', 'pending', $12)`,
      [
        bookingNumber,
        String(booking.guestName || '').trim(),
        String(booking.guestEmail || '').trim(),
        String(booking.guestPhone || '').trim(),
        booking.checkIn,
        booking.checkOut,
        guestsCount,
        room.type,
        room.id,
        amount / 100,
        paymentIntent.id,
        booking.specialRequests || null,
      ]
    )

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      bookingNumber,
      amount,
    })
  } catch (error) {
    console.error('Payment intent creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
