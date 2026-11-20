import { NextResponse } from 'next/server'
import {
  ALLOWED_PREVIEW_HOURS,
  assertSameOrigin,
  isAdminRequest,
  signPreviewToken,
} from '@/lib/admin-auth'

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  }

  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: 'Origine richiesta non valida' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const rawHours = body?.expiresInHours
  const hours = rawHours === undefined ? 168 : Number(rawHours)

  if (!Number.isInteger(hours) || !(ALLOWED_PREVIEW_HOURS as readonly number[]).includes(hours)) {
    return NextResponse.json(
      { error: 'Durata anteprima non valida. Valori consentiti: 24, 72 o 168 ore.' },
      { status: 400 }
    )
  }

  const { token, expiresAt, expiresInHours } = await signPreviewToken(hours)
  const origin = new URL(request.url).origin
  const url = `${origin}/api/preview?token=${encodeURIComponent(token)}`

  return NextResponse.json(
    { url, expiresAt, expiresInHours },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
