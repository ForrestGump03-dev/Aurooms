import { NextResponse } from 'next/server'
import { assertSameOrigin, isAdminRequest } from '@/lib/admin-auth'
import { sendTestNotification } from '@/lib/push'

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: 'Origine richiesta non valida' }, { status: 403 })
  }

  try {
    const result = await sendTestNotification()

    return NextResponse.json({
      success: true,
      message: 'Notifica di test inviata a tutti i dispositivi',
      ...result,
    })
  } catch (error) {
    console.error('Error sending test notification:', error)
    return NextResponse.json(
      { error: 'Errore nell\'invio della notifica di test' },
      { status: 500 }
    )
  }
}
