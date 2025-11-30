import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { query } from '@/lib/db'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

// Verifica autenticazione
async function verifyAuth(request: Request): Promise<boolean> {
  const token = request.headers.get('cookie')?.match(/admin-token=([^;]+)/)?.[1]
  
  if (!token) return false

  try {
    await jwtVerify(token, JWT_SECRET)
    return true
  } catch {
    return false
  }
}

// GET - Ottieni singola prenotazione
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthenticated = await verifyAuth(request)
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const result = await query(
      `SELECT * FROM bookings WHERE id = $1`,
      [params.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Prenotazione non trovata' }, { status: 404 })
    }

    return NextResponse.json({ booking: result.rows[0] })
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { error: 'Errore nel caricamento della prenotazione' },
      { status: 500 }
    )
  }
}

// DELETE - Elimina prenotazione
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthenticated = await verifyAuth(request)
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const result = await query(
      `DELETE FROM bookings WHERE id = $1 RETURNING *`,
      [params.id]
    )

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

// PUT - Modifica prenotazione
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthenticated = await verifyAuth(request)
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const data = await request.json()

    const result = await query(
      `UPDATE bookings SET
        guest_name = $1,
        guest_email = $2,
        guest_phone = $3,
        room_type = $4,
        check_in = $5,
        check_out = $6,
        guests_count = $7,
        total_amount = $8,
        payment_status = $9,
        special_requests = $10
      WHERE id = $11
      RETURNING *`,
      [
        data.guest_name,
        data.guest_email,
        data.guest_phone,
        data.room_type,
        data.check_in,
        data.check_out,
        data.guests_count,
        data.total_amount,
        data.payment_status,
        data.special_requests,
        params.id,
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
