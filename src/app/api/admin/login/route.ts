import { NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { assertSameOrigin, getAdminPassword, getSigningSecret } from '@/lib/admin-auth'

const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()

const RATE_LIMIT = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
  blockDurationMs: 60 * 60 * 1000,
}

function checkRateLimit(ip: string): { allowed: boolean; remainingAttempts?: number } {
  const now = Date.now()
  const attempts = loginAttempts.get(ip)

  if (!attempts || now - attempts.lastAttempt > RATE_LIMIT.windowMs) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now })
    return { allowed: true, remainingAttempts: RATE_LIMIT.maxAttempts - 1 }
  }

  if (attempts.count >= RATE_LIMIT.maxAttempts) {
    if (now - attempts.lastAttempt < RATE_LIMIT.blockDurationMs) {
      return { allowed: false }
    }
    loginAttempts.set(ip, { count: 1, lastAttempt: now })
    return { allowed: true, remainingAttempts: RATE_LIMIT.maxAttempts - 1 }
  }

  attempts.count++
  attempts.lastAttempt = now
  return { allowed: true, remainingAttempts: RATE_LIMIT.maxAttempts - attempts.count }
}

export async function POST(request: Request) {
  try {
    if (!assertSameOrigin(request)) {
      return NextResponse.json({ error: 'Origine richiesta non valida' }, { status: 403 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    const rateLimitCheck = checkRateLimit(ip)
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { error: 'Troppi tentativi. Riprova tra 1 ora.' },
        { status: 429 }
      )
    }

    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: 'Password richiesta' }, { status: 400 })
    }

    if (password !== getAdminPassword()) {
      return NextResponse.json(
        {
          error: 'Password errata',
          remainingAttempts: rateLimitCheck.remainingAttempts,
        },
        { status: 401 }
      )
    }

    const token = await new SignJWT({ admin: true })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(getSigningSecret())

    const response = NextResponse.json({ success: true })
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })

    loginAttempts.delete(ip)
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Configurazione admin non valida o errore del server' },
      { status: 500 }
    )
  }
}
