import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAdminToken } from '@/lib/admin-auth'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const token = request.cookies.get('admin-token')?.value
  const isAdmin = token ? await verifyAdminToken(token) : false

  // 1. Protect Admin routes (except /admin/login)
  if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
    if (!isAdmin) {
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete('admin-token')
      return response
    }
    return NextResponse.next()
  }

  // 2. Immediate env-level maintenance override (fast edge rejection)
  const isEnvMaintenance = process.env.MAINTENANCE_MODE?.toLowerCase().trim() === 'true' ||
                           process.env.MAINTENANCE_MODE === '1'

  if (isEnvMaintenance && !isAdmin) {
    const isExemptedPath =
      path.startsWith('/admin') ||
      path.startsWith('/api/admin') ||
      path.startsWith('/api/webhooks')

    if (!isExemptedPath) {
      if (path.startsWith('/api/')) {
        return NextResponse.json(
          {
            error: 'Service temporarily under maintenance. Please try again later.',
            maintenance: true,
          },
          {
            status: 503,
            headers: {
              'Retry-After': '3600',
              'Cache-Control': 'no-store, no-cache, must-revalidate',
            },
          }
        )
      }
    }
  }

  const requestHeaders = new Headers(request.headers)
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
