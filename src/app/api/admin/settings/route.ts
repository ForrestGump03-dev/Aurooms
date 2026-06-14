import { NextResponse } from 'next/server'
import { assertSameOrigin, isAdminRequest } from '@/lib/admin-auth'
import { getSiteSettings, saveSiteSettings, validateSiteSettingsPayload } from '@/lib/site-settings'

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  }

  const settings = await getSiteSettings()
  return NextResponse.json(
    { settings },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}

export async function PUT(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  }

  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: 'Origine richiesta non valida' }, { status: 403 })
  }

  const data = await request.json()
  const { settings, error } = validateSiteSettingsPayload(data)

  if (!settings) {
    return NextResponse.json({ error }, { status: 400 })
  }

  const saved = await saveSiteSettings(settings)
  return NextResponse.json({ success: true, settings: saved })
}
