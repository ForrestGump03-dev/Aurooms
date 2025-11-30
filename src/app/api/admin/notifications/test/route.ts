import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { sendTestNotification } from '@/lib/push'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

// Verifica autenticazione
async function verifyAuth() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin-token')

  if (!token) {
    return false
  }

  try {
    await jwtVerify(token.value, JWT_SECRET)
    return true
  } catch {
    return false
  }
}

// POST: Invia notifica di test
export async function POST() {
  const isAuthed = await verifyAuth()
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await sendTestNotification()
    
    return NextResponse.json({ 
      success: true,
      message: 'Notifica di test inviata a tutti i dispositivi'
    })

  } catch (error) {
    console.error('Error sending test notification:', error)
    return NextResponse.json(
      { error: 'Errore nell\'invio della notifica di test' },
      { status: 500 }
    )
  }
}
