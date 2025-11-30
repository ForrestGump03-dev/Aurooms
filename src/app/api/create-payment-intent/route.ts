import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { query } from '@/lib/db'
import { generateBookingNumber } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const { amount, booking } = await request.json()

    console.log('=== Creating Payment Intent ===')
    console.log('Booking data:', booking)
    console.log('Amount:', amount)

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      metadata: {
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        roomType: booking.roomType,
        guestsCount: booking.guestsCount.toString(),
      },
    })

    // Create booking in database
    const bookingNumber = generateBookingNumber()
    console.log('Generated booking number:', bookingNumber)
    console.log('Inserting booking with room_id:', booking.roomId)
    
    await query(
      `INSERT INTO bookings (
        booking_number, guest_name, guest_email, guest_phone,
        check_in, check_out, guests_count, room_type, room_id,
        total_amount, stripe_payment_intent_id, special_requests
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        bookingNumber,
        booking.guestName,
        booking.guestEmail,
        booking.guestPhone,
        booking.checkIn,
        booking.checkOut,
        booking.guestsCount,
        booking.roomType,
        booking.roomId || null,  // Add room_id
        amount / 100, // Convert back from cents
        paymentIntent.id,
        booking.specialRequests || null,
      ]
    )

    console.log('✅ Booking created successfully in database')

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      bookingNumber,
    })
  } catch (error) {
    console.error('Payment intent creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}