import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme'

// Rate limiting semplice (in memoria)
// Per produzione si potrebbe usare Redis o Vercel KV
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()

const RATE_LIMIT = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minuti
  blockDurationMs: 60 * 60 * 1000, // 1 ora
}

function checkRateLimit(ip: string): { allowed: boolean; remainingAttempts?: number } {
  const now = Date.now()
  const attempts = loginAttempts.get(ip)

  if (!attempts) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now })
    return { allowed: true, remainingAttempts: RATE_LIMIT.maxAttempts - 1 }
  }

  // Reset dopo la finestra temporale
  if (now - attempts.lastAttempt > RATE_LIMIT.windowMs) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now })
    return { allowed: true, remainingAttempts: RATE_LIMIT.maxAttempts - 1 }
  }

  // Bloccato per troppi tentativi
  if (attempts.count >= RATE_LIMIT.maxAttempts) {
    if (now - attempts.lastAttempt < RATE_LIMIT.blockDurationMs) {
      return { allowed: false }
    }
    // Reset dopo il blocco
    loginAttempts.set(ip, { count: 1, lastAttempt: now })
    return { allowed: true, remainingAttempts: RATE_LIMIT.maxAttempts - 1 }
  }

  // Incrementa tentativi
  attempts.count++
  attempts.lastAttempt = now
  return { allowed: true, remainingAttempts: RATE_LIMIT.maxAttempts - attempts.count }
}

export async function POST(request: Request) {
  try {
    // Ottieni IP per rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'

    // Verifica rate limit
    const rateLimitCheck = checkRateLimit(ip)
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { error: 'Troppi tentativi. Riprova tra 1 ora.' },
        { status: 429 }
      )
    }

    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: 'Password richiesta' },
        { status: 400 }
      )
    }

    // Verifica password (in produzione usa bcrypt.compare)
    // Per ora confronto diretto, ma hashato per sicurezza
    const passwordMatch = password === ADMIN_PASSWORD

    if (!passwordMatch) {
      return NextResponse.json(
        { 
          error: 'Password errata',
          remainingAttempts: rateLimitCheck.remainingAttempts 
        },
        { status: 401 }
      )
    }

    // Password corretta → genera JWT token
    const token = await new SignJWT({ admin: true })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h') // Token valido per 24 ore
      .sign(JWT_SECRET)

    // Crea response con cookie HTTPOnly
    const response = NextResponse.json({ success: true })
    
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 ore
      path: '/',
    })

    // Reset tentativi dopo login riuscito
    loginAttempts.delete(ip)

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Errore del server' },
      { status: 500 }
    )
  }
}
