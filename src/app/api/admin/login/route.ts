import { NextResponse } from 'next/server'
import {
  assertSameOrigin,
  signAdminToken,
  verifyAdminPassword,
} from '@/lib/admin-auth'
import {
  checkPersistentRateLimit,
  clearPersistentRateLimit,
  getClientIp,
} from '@/lib/rate-limit'

const LOGIN_RATE_LIMIT = {
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
    const rateKey = `login:${ip}`

    const rateLimitCheck = await checkPersistentRateLimit(rateKey, LOGIN_RATE_LIMIT)
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { error: 'Troppi tentativi falliti. Riprova tra 1 ora o usa il recupero password via email.' },
        { status: 429 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const password = typeof body?.password === 'string' ? body.password : ''

    if (!password) {
      return NextResponse.json({ error: 'Password richiesta' }, { status: 400 })
    }

    const { valid, sessionVersion } = await verifyAdminPassword(password)

    if (!valid) {
      return NextResponse.json(
        {
          error: 'Password errata',
          remainingAttempts: rateLimitCheck.remainingAttempts,
        },
        { status: 401 }
      )
    }

    const token = await signAdminToken(sessionVersion)

    const response = NextResponse.json({ success: true })
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })

    await clearPersistentRateLimit(rateKey)
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Configurazione admin non valida o errore del server' },
      { status: 500 }
    )
  }
}
