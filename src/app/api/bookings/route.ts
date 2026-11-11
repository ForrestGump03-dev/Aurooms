import { NextRequest, NextResponse } from 'next/server'
import { assertSameOrigin, isAdminRequest } from '@/lib/admin-auth'
import { query } from '@/lib/db'
import { sendNewBookingNotification } from '@/lib/push'

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminRequest(request))) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }
    if (!assertSameOrigin(request)) {
      return NextResponse.json({ error: 'Origine richiesta non valida' }, { status: 403 })
    }

    const booking = await request.json()

    const result = await query(
      `INSERT INTO bookings (
        booking_number, guest_name, guest_email, guest_phone,
        check_in, check_out, guests_count, room_type, room_id,
        total_amount, booking_status, special_requests
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'confirmed', $11) RETURNING *`,
      [
        booking.bookingNumber,
        booking.guestName,
        booking.guestEmail,
        booking.guestPhone,
        booking.checkIn,
        booking.checkOut,
        booking.guestsCount,
        booking.roomType,
        booking.roomId || null,
        booking.totalAmount,
        booking.specialRequests || null,
      ]
    )

    const newBooking = result.rows[0]

    try {
      await sendNewBookingNotification({
        bookingId: newBooking.id,
        bookingNumber: newBooking.booking_number,
        guestName: newBooking.guest_name,
        roomType: newBooking.room_type,
        checkIn: newBooking.check_in,
        checkOut: newBooking.check_out,
        totalAmount: newBooking.total_amount,
      })
    } catch (pushError) {
      console.error('Errore invio notifica push (non critico):', pushError)
    }

    return NextResponse.json(newBooking, { status: 201 })
  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
