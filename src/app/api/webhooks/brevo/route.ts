import { NextResponse } from 'next/server'
import { timingSafeCompare } from '@/lib/admin-auth'
import { recordBrevoEvent } from '@/lib/email'

function isAuthorized(request: Request): boolean {
  const secret = process.env.BREVO_WEBHOOK_SECRET
  if (!secret) return false

  const authorization = request.headers.get('authorization') || ''
  const customSecret = request.headers.get('x-brevo-webhook-secret') || ''

  return (
    (authorization ? timingSafeCompare(authorization, `Bearer ${secret}`) : false) ||
    (customSecret ? timingSafeCompare(customSecret, secret) : false)
  )
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  }

  try {
    const payload = await request.json()
    const events = Array.isArray(payload) ? payload : [payload]

    for (const event of events) {
      if (event && typeof event === 'object') {
        await recordBrevoEvent(event as Record<string, unknown>)
      }
    }

    return NextResponse.json({ success: true, received: events.length })
  } catch (error) {
    console.error('Brevo webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook Brevo non valido' },
      { status: 400 }
    )
  }
}
