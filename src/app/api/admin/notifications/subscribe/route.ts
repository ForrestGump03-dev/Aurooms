import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { query } from '@/lib/db'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

// Verifica autenticazione
async function verifyAuth() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin-token')

  if (!token) {
    return false
  }

  try {
    await jwtVerify(token.value, JWT_SECRET)
    return true
  } catch {
    return false
  }
}

// POST: Salva subscription per notifiche push
export async function POST(request: Request) {
  // Verifica autenticazione
  const isAuthed = await verifyAuth()
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const subscription = await request.json()

    // Estrai dati dalla subscription
    const endpoint = subscription.endpoint
    const p256dh = subscription.keys?.p256dh
    const auth = subscription.keys?.auth

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json(
        { error: 'Dati subscription mancanti' },
        { status: 400 }
      )
    }

    // Ottieni user agent per identificare il dispositivo
    const userAgent = request.headers.get('user-agent') || 'Unknown'

    // Verifica se esiste già questa subscription
    const existing = await query(
      'SELECT id FROM push_subscriptions WHERE endpoint = $1',
      [endpoint]
    )

    if (existing.rows.length > 0) {
      // Aggiorna timestamp
      await query(
        'UPDATE push_subscriptions SET updated_at = NOW() WHERE endpoint = $1',
        [endpoint]
      )
      return NextResponse.json({ 
        success: true, 
        message: 'Subscription già esistente, aggiornata' 
      })
    }

    // Salva nuova subscription
    await query(
      `INSERT INTO push_subscriptions 
       (endpoint, p256dh_key, auth_key, user_agent, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      [endpoint, p256dh, auth, userAgent]
    )

    return NextResponse.json({ 
      success: true,
      message: 'Notifiche abilitate con successo' 
    })

  } catch (error) {
    console.error('Error saving push subscription:', error)
    return NextResponse.json(
      { error: 'Errore nel salvare la subscription' },
      { status: 500 }
    )
  }
}

// DELETE: Rimuovi subscription (per disabilitare notifiche)
export async function DELETE(request: Request) {
  const isAuthed = await verifyAuth()
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { endpoint } = await request.json()

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint mancante' },
        { status: 400 }
      )
    }

    await query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint])

    return NextResponse.json({ 
      success: true,
      message: 'Subscription rimossa' 
    })

  } catch (error) {
    console.error('Error removing push subscription:', error)
    return NextResponse.json(
      { error: 'Errore nel rimuovere la subscription' },
      { status: 500 }
    )
  }
}
