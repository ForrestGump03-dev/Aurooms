import { NextResponse } from 'next/server'
import { assertSameOrigin, isAdminRequest } from '@/lib/admin-auth'
import { query } from '@/lib/db'

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: 'Origine richiesta non valida' }, { status: 403 })
  }

  try {
    const subscription = await request.json()

    const endpoint = subscription.endpoint
    const p256dh = subscription.keys?.p256dh
    const auth = subscription.keys?.auth

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json({ error: 'Dati subscription mancanti' }, { status: 400 })
    }

    const userAgent = request.headers.get('user-agent') || 'Unknown'
    const existing = await query('SELECT id FROM push_subscriptions WHERE endpoint = $1', [endpoint])

    if (existing.rows.length > 0) {
      await query('UPDATE push_subscriptions SET updated_at = NOW() WHERE endpoint = $1', [endpoint])
      return NextResponse.json({
        success: true,
        message: 'Subscription gia esistente, aggiornata',
      })
    }

    await query(
      `INSERT INTO push_subscriptions
       (endpoint, p256dh_key, auth_key, user_agent, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      [endpoint, p256dh, auth, userAgent]
    )

    return NextResponse.json({
      success: true,
      message: 'Notifiche abilitate con successo',
    })
  } catch (error) {
    console.error('Error saving push subscription:', error)
    return NextResponse.json(
      { error: 'Errore nel salvare la subscription' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: 'Origine richiesta non valida' }, { status: 403 })
  }

  try {
    const { endpoint } = await request.json()

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint mancante' }, { status: 400 })
    }

    await query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint])

    return NextResponse.json({
      success: true,
      message: 'Subscription rimossa',
    })
  } catch (error) {
    console.error('Error removing push subscription:', error)
    return NextResponse.json(
      { error: 'Errore nel rimuovere la subscription' },
      { status: 500 }
    )
  }
}
