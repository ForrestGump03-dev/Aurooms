import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Proteggi tutte le route /admin/* eccetto /admin/login
  if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
    const token = request.cookies.get('admin-token')?.value

    if (!token) {
      // Nessun token → redirect al login
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      // Verifica validità token
      await jwtVerify(token, JWT_SECRET)
      // Token valido → procedi
      return NextResponse.next()
    } catch (error) {
      // Token invalido/scaduto → redirect al login
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete('admin-token')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
