import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// GET /api/rooms/available?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD&guests=N
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const checkIn = searchParams.get('checkIn')
  const checkOut = searchParams.get('checkOut')
  const guests = searchParams.get('guests')

  if (!checkIn || !checkOut) {
    return NextResponse.json({ error: 'Missing checkIn or checkOut dates' }, { status: 400 })
  }

  try {
    // Parse guests count
    const guestsCount = guests ? parseInt(guests) : 1
    
    // Get all rooms
    const allRooms = await query(
      `SELECT id, name, type, description, price_per_night, max_guests, 
              size, bed_type, amenities, image_urls 
       FROM rooms 
       WHERE available = true 
       ORDER BY price_per_night ASC`
    )

    // Check availability for each room
    const availableRooms = []
    
    for (const room of allRooms.rows) {
      // First check capacity - skip if not enough
      if (room.max_guests < guestsCount) {
        continue
      }
      
      // Check if room is booked in the requested period
      const bookings = await query(
        `SELECT COUNT(*) as count FROM bookings 
         WHERE room_id = $1 
         AND booking_status IN ('confirmed', 'pending')
         AND (
           (check_in <= $2 AND check_out > $2) OR
           (check_in < $3 AND check_out >= $3) OR
           (check_in >= $2 AND check_out <= $3)
         )`,
        [room.id, checkIn, checkOut]
      )

      const isBooked = bookings.rows[0].count > 0
      
      if (!isBooked) {
        availableRooms.push({
          id: String(room.id),
          name: room.name,
          type: room.type,
          description: room.description || '',
          pricePerNight: Number(room.price_per_night),
          maxGuests: room.max_guests,
          size: room.size || '',
          bedType: room.bed_type || '',
          amenities: Array.isArray(room.amenities) ? room.amenities : [],
          imageUrls: Array.isArray(room.image_urls) && room.image_urls.length ? room.image_urls : [],
          available: true
        })
      }
    }

    // If no rooms available, find next available dates
    if (availableRooms.length === 0) {
      const nextAvailable = await query(
        `SELECT MIN(check_out) as next_date 
         FROM bookings 
         WHERE check_out > $1 
         AND booking_status IN ('confirmed', 'pending')`,
        [checkOut]
      )

      return NextResponse.json({
        available: false,
        rooms: [],
        message: 'No rooms available for the selected dates',
        nextAvailableDate: nextAvailable.rows[0]?.next_date || null
      })
    }

    return NextResponse.json({
      available: true,
      rooms: availableRooms,
      count: availableRooms.length
    })
  } catch (error) {
    console.error('Error checking room availability:', error)
    return NextResponse.json({ error: 'Failed to check availability' }, { status: 500 })
  }
}
