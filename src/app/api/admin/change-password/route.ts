import { NextResponse } from 'next/server'
import {
  assertSameOrigin,
  isAdminRequest,
  signAdminToken,
  updateAdminPassword,
  verifyAdminPassword,
} from '@/lib/admin-auth'
import { sendAdminPasswordChangedEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    if (!(await isAdminRequest(request))) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    if (!assertSameOrigin(request)) {
      return NextResponse.json({ error: 'Origine richiesta non valida' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const currentPassword = typeof body?.currentPassword === 'string' ? body.currentPassword : ''
    const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : ''

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Inserisci sia la password attuale sia la nuova password' },
        { status: 400 }
      )
    }

    if (newPassword.length < 10) {
      return NextResponse.json(
        { error: 'La nuova password deve contenere almeno 10 caratteri' },
        { status: 400 }
      )
    }

    if (newPassword.length > 128) {
      return NextResponse.json(
        { error: 'La password non può superare i 128 caratteri' },
        { status: 400 }
      )
    }

    const { valid } = await verifyAdminPassword(currentPassword)
    if (!valid) {
      return NextResponse.json(
        { error: 'La password attuale inserita non è corretta' },
        { status: 401 }
      )
    }

    const { sessionVersion } = await updateAdminPassword(newPassword)
    const newToken = await signAdminToken(sessionVersion)

    await sendAdminPasswordChangedEmail()

    const response = NextResponse.json({
      success: true,
      message: 'Password aggiornata con successo. Tutte le altre sessioni sono state disconnesse.',
    })

    response.cookies.set('admin-token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: 'Errore durante la modifica della password' },
      { status: 500 }
    )
  }
}

