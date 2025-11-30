import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export async function GET(request: Request) {
  try {
    // Estrai il token dal cookie
    const cookieHeader = request.headers.get('cookie') || ''
    const tokenMatch = cookieHeader.match(/admin-token=([^;]+)/)
    
    if (!tokenMatch) {
      return NextResponse.json(
        { authenticated: false, error: 'Token non trovato' },
        { status: 401 }
      )
    }

    const token = tokenMatch[1]

    // Verifica il token JWT
    const { payload } = await jwtVerify(token, JWT_SECRET)

    // Token valido
    return NextResponse.json({
      authenticated: true,
      role: payload.role,
      exp: payload.exp,
    })
  } catch (error) {
    // Token non valido o scaduto
    return NextResponse.json(
      { authenticated: false, error: 'Token non valido o scaduto' },
      { status: 401 }
    )
  }
}
