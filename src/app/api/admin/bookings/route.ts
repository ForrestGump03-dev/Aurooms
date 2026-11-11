import { NextResponse } from 'next/server'
import { assertSameOrigin, isAdminRequest } from '@/lib/admin-auth'
import { query } from '@/lib/db'

export async function GET(request: Request) {
  try {
    if (!(await isAdminRequest(request))) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const result = await query('SELECT * FROM bookings ORDER BY created_at DESC')

    return NextResponse.json(
      { bookings: result.rows },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Errore nel caricamento delle prenotazioni' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAdminRequest(request))) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }
    if (!assertSameOrigin(request)) {
      return NextResponse.json({ error: 'Origine richiesta non valida' }, { status: 403 })
    }

    const data = await request.json()

    const result = await query(
      `INSERT INTO bookings (
        booking_number,
        guest_name,
        guest_email,
        guest_phone,
        room_type,
        room_id,
        check_in,
        check_out,
        guests_count,
        total_amount,
        payment_status,
        booking_status,
        special_requests
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'confirmed', $12)
      RETURNING *`,
      [
        data.booking_number || `MANUAL-${Date.now()}`,
        data.guest_name,
        data.guest_email,
        data.guest_phone,
        data.room_type,
        data.room_id || null,
        data.check_in,
        data.check_out,
        data.guests_count,
        data.total_amount,
        data.payment_status || 'pending',
        data.special_requests || null,
      ]
    )

    return NextResponse.json({ success: true, booking: result.rows[0] })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Errore nella creazione della prenotazione' },
      { status: 500 }
    )
  }
}
