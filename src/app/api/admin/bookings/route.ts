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

// GET - Ottieni tutte le prenotazioni
export async function GET(request: Request) {
  try {
    const isAuthenticated = await verifyAuth(request)
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const result = await query(
      `SELECT * FROM bookings ORDER BY created_at DESC`
    )

    return NextResponse.json({ bookings: result.rows })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Errore nel caricamento delle prenotazioni' },
      { status: 500 }
    )
  }
}

// POST - Crea nuova prenotazione manuale
export async function POST(request: Request) {
  try {
    const isAuthenticated = await verifyAuth(request)
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const data = await request.json()

    const result = await query(
      `INSERT INTO bookings (
        booking_number,
        guest_name,
        guest_email,
        guest_phone,
        room_type,
        check_in,
        check_out,
        guests_count,
        total_amount,
        payment_status,
        special_requests
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        data.booking_number || `MANUAL-${Date.now()}`,
        data.guest_name,
        data.guest_email,
        data.guest_phone,
        data.room_type,
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
