import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { query } from '@/lib/db'
import { sendBookingConfirmation } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object

      // Update booking status
      await query(
        'UPDATE bookings SET payment_status = $1, updated_at = CURRENT_TIMESTAMP WHERE stripe_payment_intent_id = $2',
        ['confirmed', paymentIntent.id]
      )

      // Get booking details for email
      const result = await query(
        'SELECT * FROM bookings WHERE stripe_payment_intent_id = $1',
        [paymentIntent.id]
      )

      if (result.rows.length > 0) {
        const booking = result.rows[0]
        
        // Send confirmation email
        await sendBookingConfirmation({
          bookingNumber: booking.booking_number,
          guestName: booking.guest_name,
          guestEmail: booking.guest_email,
          checkIn: booking.check_in,
          checkOut: booking.check_out,
          roomType: booking.room_type,
          guestsCount: booking.guests_count,
          totalAmount: booking.total_amount,
          specialRequests: booking.special_requests,
        })
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