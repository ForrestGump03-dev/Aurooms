import { NextResponse } from 'next/server'
import { assertSameOrigin, isAdminRequest } from '@/lib/admin-auth'
import { mapRoomRow, validateRoomPayload } from '@/lib/rooms'
import { query } from '@/lib/db'

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  }

  const result = await query(
    `SELECT id, name, type, description, price_per_night, max_guests,
            size, bed_type, amenities, image_urls, available, created_at, updated_at
     FROM rooms
     ORDER BY created_at ASC, id ASC`
  )

  return NextResponse.json(
    { rooms: result.rows.map(mapRoomRow) },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  }

  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: 'Origine richiesta non valida' }, { status: 403 })
  }

  const data = await request.json()
  const { room, error } = validateRoomPayload(data)

  if (!room) {
    return NextResponse.json({ error }, { status: 400 })
  }

  const result = await query(
    `INSERT INTO rooms (
       name, type, description, price_per_night, max_guests, size, bed_type,
       amenities, image_urls, available, created_at, updated_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     RETURNING id, name, type, description, price_per_night, max_guests,
               size, bed_type, amenities, image_urls, available, created_at, updated_at`,
    [
      room.name,
      room.type,
      room.description,
      room.pricePerNight,
      room.maxGuests,
      room.size || null,
      room.bedType || null,
      room.amenities,
      room.imageUrls,
      room.available,
    ]
  )

  return NextResponse.json({ success: true, room: mapRoomRow(result.rows[0]) }, { status: 201 })
}
