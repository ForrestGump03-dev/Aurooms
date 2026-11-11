import { NextResponse } from 'next/server'
import {
  assertSameOrigin,
  consumeAdminPasswordResetToken,
} from '@/lib/admin-auth'
import { sendAdminPasswordChangedEmail } from '@/lib/email'
import {
  checkPersistentRateLimit,
  clearPersistentRateLimit,
  getClientIp,
} from '@/lib/rate-limit'

const RESET_PASSWORD_RATE_LIMIT = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
  blockDurationMs: 60 * 60 * 1000,
}

export async function POST(request: Request) {
  try {
    if (!assertSameOrigin(request)) {
      return NextResponse.json({ error: 'Origine richiesta non valida' }, { status: 403 })
    }

    const ip = getClientIp(request)
    const rateKey = `reset-pwd:${ip}`

    const rateCheck = await checkPersistentRateLimit(rateKey, RESET_PASSWORD_RATE_LIMIT)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Troppi tentativi. Riprova più tardi.' },
        { status: 429 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const token = typeof body?.token === 'string' ? body.token.trim() : ''
    const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : ''

    if (!token) {
      return NextResponse.json({ error: 'Token di sicurezza mancante' }, { status: 400 })
    }

    if (newPassword.length < 10) {
      return NextResponse.json(
        { error: 'La nuova password deve contenere almeno 10 caratteri' },
        { status: 400 }
      )
    }

    if (newPassword.length > 128) {
      return NextResponse.json(
        { error: 'La password non può superare i 128 caratteri' },
        { status: 400 }
      )
    }

    const result = await consumeAdminPasswordResetToken(token, newPassword)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Token non valido o scaduto' },
        { status: 400 }
      )
    }

    await clearPersistentRateLimit(rateKey)
    await clearPersistentRateLimit(`login:${ip}`)
    await sendAdminPasswordChangedEmail()

    const response = NextResponse.json({
      success: true,
      message: 'Password aggiornata con successo. Ora puoi effettuare il login.',
    })
    response.cookies.delete('admin-token')
    return response
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Errore durante l\'aggiornamento della password' },
      { status: 500 }
    )
  }
}

