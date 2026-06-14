import { NextResponse } from 'next/server'
import { assertSameOrigin } from '@/lib/admin-auth'

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: 'Origine richiesta non valida' }, { status: 403 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.delete('admin-token')
  return response
}
