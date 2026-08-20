import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getAvailableRooms } from '@/lib/rooms'
import { getMaintenanceApiResponse, shouldBlockApiForMaintenance } from '@/lib/maintenance'

export async function GET(request: NextRequest) {
  try {
    if (await shouldBlockApiForMaintenance(request)) {
      return getMaintenanceApiResponse()
    }

    const rooms = await getAvailableRooms()
    return NextResponse.json({ rooms })
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (await shouldBlockApiForMaintenance(request)) {
    return getMaintenanceApiResponse()
  }

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
