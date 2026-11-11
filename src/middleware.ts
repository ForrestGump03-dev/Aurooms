import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

async function verifyAdminTokenEdge(token?: string): Promise<boolean> {
  if (!token) return false
  const secret = process.env.JWT_SECRET
  if (!secret || secret === 'your-secret-key-change-in-production' || secret === 'your-secret-key') {
    return false
  }
  try {
    await jwtVerify(token, new TextEncoder().encode(secret))
    return true
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const token = request.cookies.get('admin-token')?.value
  const isAdmin = token ? await verifyAdminTokenEdge(token) : false

  // 1. Protect Admin routes (except /admin/login and /admin/reset-password)
  const isPublicAdminAuthPage =
    path.startsWith('/admin/login') || path.startsWith('/admin/reset-password')

  if (path.startsWith('/admin') && !isPublicAdminAuthPage) {
    if (!isAdmin) {
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete('admin-token')
      return response
    }
    return NextResponse.next()
  }

  // 2. Strip any client-spoofed internal headers before forwarding
  const requestHeaders = new Headers(request.headers)
  requestHeaders.delete('x-is-admin')
  requestHeaders.delete('x-pathname')
  requestHeaders.set('x-pathname', path)

  if (isAdmin) {
    requestHeaders.set('x-is-admin', '1')
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)'],
}
