import { NextResponse } from 'next/server'
import { assertSameOrigin, isAdminRequest } from '@/lib/admin-auth'
import { processEmailQueue } from '@/lib/email'

function isCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return request.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(request: Request) {
  if (!isCronRequest(request)) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  }

  const result = await processEmailQueue(10)
  return NextResponse.json({ success: true, ...result })
}

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  }
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: 'Origine richiesta non valida' }, { status: 403 })
  }

  const result = await processEmailQueue(10)
  return NextResponse.json({ success: true, ...result })
}
