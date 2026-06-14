import { NextResponse } from 'next/server'
import { extractAdminToken, verifyAdminToken } from '@/lib/admin-auth'

export async function GET(request: Request) {
  const token = extractAdminToken(request)

  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json(
      { authenticated: false, error: 'Token non valido o scaduto' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  return NextResponse.json(
    { authenticated: true },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
