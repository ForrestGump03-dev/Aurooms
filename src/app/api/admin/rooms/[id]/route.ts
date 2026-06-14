import { NextResponse } from 'next/server'
import { assertSameOrigin, isAdminRequest } from '@/lib/admin-auth'
import { mapRoomRow, validateRoomPayload } from '@/lib/rooms'
import { query } from '@/lib/db'

function parseId(id: string): number | null {
  const parsed = Number.parseInt(id, 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  }

  const { id } = await params
  const roomId = parseId(id)
  if (!roomId) return NextResponse.json({ error: 'ID stanza non valido' }, { status: 400 })

  const result = await query(
    `SELECT id, name, type, description, price_per_night, max_guests,
            size, bed_type, amenities, image_urls, available, created_at, updated_at
     FROM rooms
     WHERE id = $1`,
    [roomId]
  )

  if (!result.rows.length) {
    return NextResponse.json({ error: 'Stanza non trovata' }, { status: 404 })
  }

  return NextResponse.json(
    { room: mapRoomRow(result.rows[0]) },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  }

  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: 'Origine richiesta non valida' }, { status: 403 })
  }

  const { id } = await params
  const roomId = parseId(id)
  if (!roomId) return NextResponse.json({ error: 'ID stanza non valido' }, { status: 400 })

  const data = await request.json()
  const { room, error } = validateRoomPayload(data)

  if (!room) {
    return NextResponse.json({ error }, { status: 400 })
  }

  const result = await query(
    `UPDATE rooms SET
       name = $1,
       type = $2,
       description = $3,
       price_per_night = $4,
       max_guests = $5,
       size = $6,
       bed_type = $7,
       amenities = $8,
       image_urls = $9,
       available = $10,
       updated_at = CURRENT_TIMESTAMP
     WHERE id = $11
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
      roomId,
    ]
  )

  if (!result.rows.length) {
    return NextResponse.json({ error: 'Stanza non trovata' }, { status: 404 })
  }

  return NextResponse.json({ success: true, room: mapRoomRow(result.rows[0]) })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  }

  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: 'Origine richiesta non valida' }, { status: 403 })
  }

  const { id } = await params
  const roomId = parseId(id)
  if (!roomId) return NextResponse.json({ error: 'ID stanza non valido' }, { status: 400 })

  const result = await query(
    `UPDATE rooms
     SET available = false, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id, name, type, description, price_per_night, max_guests,
               size, bed_type, amenities, image_urls, available, created_at, updated_at`,
    [roomId]
  )

  if (!result.rows.length) {
    return NextResponse.json({ error: 'Stanza non trovata' }, { status: 404 })
  }

  return NextResponse.json({ success: true, room: mapRoomRow(result.rows[0]) })
}
