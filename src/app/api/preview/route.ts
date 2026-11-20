import { NextRequest, NextResponse } from 'next/server'
import { PREVIEW_COOKIE_NAME, verifyPreviewToken } from '@/lib/admin-auth'

const PREVIEW_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Referrer-Policy': 'no-referrer',
} as const

function sanitizeNextPath(rawNext: string | null): string {
  if (
    rawNext &&
    rawNext.startsWith('/') &&
    !rawNext.startsWith('//') &&
    !rawNext.startsWith('/\\') &&
    !rawNext.startsWith('/admin') &&
    !rawNext.startsWith('/api')
  ) {
    return rawNext
  }
  return '/'
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')?.trim()
  const exit = request.nextUrl.searchParams.get('exit')
  const safeNext = sanitizeNextPath(request.nextUrl.searchParams.get('next'))

  if (exit === '1') {
    const response = NextResponse.redirect(new URL('/', request.url), {
      headers: {
        ...PREVIEW_HEADERS,
        'X-Preview-Status': 'exited',
      },
    })
    response.cookies.delete(PREVIEW_COOKIE_NAME)
    return response
  }

  const verification = await verifyPreviewToken(token || undefined)

  if (verification.valid && verification.exp && token) {
    const remainingSeconds = Math.max(0, Math.floor(verification.exp - Date.now() / 1000))
    if (remainingSeconds > 0) {
      const response = NextResponse.redirect(new URL(safeNext, request.url), {
        headers: {
          ...PREVIEW_HEADERS,
          'X-Preview-Status': 'active',
        },
      })
      response.cookies.set(PREVIEW_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: remainingSeconds,
        path: '/',
      })
      return response
    }
  }

  const response = NextResponse.redirect(new URL('/', request.url), {
    headers: {
      ...PREVIEW_HEADERS,
      'X-Preview-Status': 'invalid',
    },
  })
  response.cookies.delete(PREVIEW_COOKIE_NAME)
  return response
}
