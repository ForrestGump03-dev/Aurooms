import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// GET: Fetch all available rooms
export async function GET() {
  try {
    const result = await query(
      `SELECT id, name, type, description, price_per_night, max_guests, 
              size, bed_type, amenities, image_urls, available 
       FROM rooms 
       WHERE available = true 
       ORDER BY price_per_night ASC`
    )
    
    return NextResponse.json({ rooms: result.rows })
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 })
  }
}

// POST: Check room availability
export async function POST(request: NextRequest) {
  const { roomType, checkIn, checkOut } = await request.json()
  
  // Controlla se ci sono prenotazioni sovrapposte
  const result = await query(
    `SELECT COUNT(*) as count FROM bookings 
     WHERE room_type = $1 
     AND booking_status = 'confirmed'
     AND (
       (check_in <= $2 AND check_out >= $2) OR
       (check_in <= $3 AND check_out >= $3) OR
       (check_in >= $2 AND check_out <= $3)
     )`,
    [roomType, checkIn, checkOut]
  )
  
  const isAvailable = result.rows[0].count === 0
  
  return NextResponse.json({ available: isAvailable })
}