import { NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin-auth'
import { query } from '@/lib/db'

export async function GET(request: Request) {
  try {
    if (!(await isAdminRequest(request))) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const result = await query(
      `SELECT
         COUNT(*)::int AS total_bookings,
         COALESCE(SUM(total_amount), 0)::numeric AS total_revenue,
         COUNT(*) FILTER (WHERE check_in >= CURRENT_DATE)::int AS upcoming_check_ins
       FROM bookings
       WHERE booking_status = 'confirmed'
         AND payment_status = 'confirmed'`
    )

    const row = result.rows[0]

    return NextResponse.json(
      {
        stats: {
          totalBookings: Number(row.total_bookings || 0),
          totalRevenue: Number(row.total_revenue || 0),
          upcomingCheckIns: Number(row.upcoming_check_ins || 0),
        },
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Errore nel caricamento delle statistiche' },
      { status: 500 }
    )
  }
}
