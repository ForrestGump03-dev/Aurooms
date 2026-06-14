import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getAvailableRooms } from '@/lib/rooms'

export async function GET() {
  try {
    const rooms = await getAvailableRooms()
    return NextResponse.json({ rooms })
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { roomType, checkIn, checkOut } = await request.json()

  const result = await query(
    `SELECT COUNT(*) as count FROM bookings
     WHERE room_type = $1
     AND booking_status = 'confirmed'
     AND (
       (check_in <= $2 AND check_out > $2) OR
       (check_in < $3 AND check_out >= $3) OR
       (check_in >= $2 AND check_out <= $3)
     )`,
    [roomType, checkIn, checkOut]
  )

  const isAvailable = Number(result.rows[0].count) === 0
  return NextResponse.json({ available: isAvailable })
}
