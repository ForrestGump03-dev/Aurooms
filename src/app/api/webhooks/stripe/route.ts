import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { query } from '@/lib/db'
import { enqueueBookingEmail, processEmailQueue } from '@/lib/email'
import { sendNewBookingNotification } from '@/lib/push'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object

      const result = await query(
        `UPDATE bookings
         SET payment_status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE stripe_payment_intent_id = $2
           AND payment_status <> $1
         RETURNING *`,
        ['confirmed', paymentIntent.id]
      )

      if (result.rows.length > 0) {
        const booking = result.rows[0]
        const bookingEmail = {
          bookingId: booking.id,
          bookingNumber: booking.booking_number,
          guestName: booking.guest_name,
          guestEmail: booking.guest_email,
          checkIn: booking.check_in,
          checkOut: booking.check_out,
          roomType: booking.room_type,
          guestsCount: booking.guests_count,
          totalAmount: booking.total_amount,
          specialRequests: booking.special_requests,
        }

        try {
          await enqueueBookingEmail(bookingEmail, 'payment_completed')
          await processEmailQueue(3)
        } catch (emailError) {
          console.error('Email queue error after payment confirmation:', emailError)
        }

        try {
          await sendNewBookingNotification({
            bookingId: booking.id,
            bookingNumber: booking.booking_number,
            guestName: booking.guest_name,
            roomType: booking.room_type,
            checkIn: booking.check_in,
            checkOut: booking.check_out,
            totalAmount: Number(booking.total_amount),
          })
        } catch (pushError) {
          console.error('Push notification error after payment confirmation:', pushError)
        }
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object

      const result = await query(
        `UPDATE bookings
         SET payment_status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE stripe_payment_intent_id = $2
           AND payment_status <> $1
         RETURNING *`,
        ['failed', paymentIntent.id]
      )

      if (result.rows.length > 0) {
        const booking = result.rows[0]

        try {
          await enqueueBookingEmail(
            {
              bookingId: booking.id,
              bookingNumber: booking.booking_number,
              guestName: booking.guest_name,
              guestEmail: booking.guest_email,
              checkIn: booking.check_in,
              checkOut: booking.check_out,
              roomType: booking.room_type,
              guestsCount: booking.guests_count,
              totalAmount: booking.total_amount,
              specialRequests: booking.special_requests,
            },
            'payment_failed'
          )
          await processEmailQueue(3)
        } catch (emailError) {
          console.error('Email queue error after payment failure:', emailError)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
