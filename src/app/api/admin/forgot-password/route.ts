import { NextResponse } from 'next/server'
import {
  assertSameOrigin,
  createAdminPasswordResetToken,
} from '@/lib/admin-auth'
import {
  getAdminRecipientEmail,
  sendAdminPasswordResetEmail,
} from '@/lib/email'
import {
  checkPersistentRateLimit,
  getClientIp,
} from '@/lib/rate-limit'

const FORGOT_PASSWORD_RATE_LIMIT = {
  maxAttempts: 3,
  windowMs: 15 * 60 * 1000,
  blockDurationMs: 60 * 60 * 1000,
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!local || !domain) return '***'
  const visible = local.slice(0, 2)
  return `${visible}${'*'.repeat(Math.max(3, local.length - 2))}@${domain}`
}

export async function POST(request: Request) {
  try {
    if (!assertSameOrigin(request)) {
      return NextResponse.json({ error: 'Origine richiesta non valida' }, { status: 403 })
    }

    const ip = getClientIp(request)
    const rateKey = `forgot-pwd:${ip}`

    const rateCheck = await checkPersistentRateLimit(rateKey, FORGOT_PASSWORD_RATE_LIMIT)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Hai richiesto troppi link di recupero. Riprova più tardi.' },
        { status: 429 }
      )
    }

    const { token } = await createAdminPasswordResetToken()
    const origin = new URL(request.url).origin
    const resetUrl = `${origin}/admin/reset-password?token=${encodeURIComponent(token)}`

    await sendAdminPasswordResetEmail(resetUrl)
    const recipient = await getAdminRecipientEmail()

    return NextResponse.json({
      success: true,
      maskedEmail: maskEmail(recipient),
      message: `Abbiamo inviato un link di recupero (valido 20 minuti) all'indirizzo ${maskEmail(recipient)}.`,
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Impossibile inviare l\'email di recupero. Verifica la configurazione Brevo.' },
      { status: 500 }
    )
  }
}

