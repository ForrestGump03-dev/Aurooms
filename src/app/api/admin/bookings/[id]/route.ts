import { NextResponse } from 'next/server'
import { assertSameOrigin, isAdminRequest } from '@/lib/admin-auth'
import { query } from '@/lib/db'

function parseId(id: string): number | null {
  const parsed = Number.parseInt(id, 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdminRequest(request))) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const { id } = await params
    const bookingId = parseId(id)
    if (!bookingId) return NextResponse.json({ error: 'ID prenotazione non valido' }, { status: 400 })

    const result = await query('SELECT * FROM bookings WHERE id = $1', [bookingId])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Prenotazione non trovata' }, { status: 404 })
    }

    return NextResponse.json(
      { booking: result.rows[0] },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { error: 'Errore nel caricamento della prenotazione' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdminRequest(request))) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }
    if (!assertSameOrigin(request)) {
      return NextResponse.json({ error: 'Origine richiesta non valida' }, { status: 403 })
    }

    const { id } = await params
    const bookingId = parseId(id)
    if (!bookingId) return NextResponse.json({ error: 'ID prenotazione non valido' }, { status: 400 })

    const result = await query('DELETE FROM bookings WHERE id = $1 RETURNING *', [bookingId])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Prenotazione non trovata' }, { status: 404 })
    }

    return NextResponse.json({ success: true, deleted: result.rows[0] })
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione della prenotazione' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdminRequest(request))) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }
    if (!assertSameOrigin(request)) {
      return NextResponse.json({ error: 'Origine richiesta non valida' }, { status: 403 })
    }

    const { id } = await params
    const bookingId = parseId(id)
    if (!bookingId) return NextResponse.json({ error: 'ID prenotazione non valido' }, { status: 400 })

    const data = await request.json()

    const result = await query(
      `UPDATE bookings SET
        guest_name = $1,
        guest_email = $2,
        guest_phone = $3,
        room_type = $4,
        room_id = $5,
        check_in = $6,
        check_out = $7,
        guests_count = $8,
        total_amount = $9,
        payment_status = $10,
        special_requests = $11,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $12
      RETURNING *`,
      [
        data.guest_name,
        data.guest_email,
        data.guest_phone,
        data.room_type,
        data.room_id || null,
        data.check_in,
        data.check_out,
        data.guests_count,
        data.total_amount,
        data.payment_status,
        data.special_requests,
        bookingId,
      ]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Prenotazione non trovata' }, { status: 404 })
    }

    return NextResponse.json({ success: true, booking: result.rows[0] })
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Errore nella modifica della prenotazione' },
      { status: 500 }
    )
  }
}
