import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Verifica che sia una chiamata dal Cron di Vercel
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }

  try {
    const apiKey = process.env.BREVO_API_KEY
    if (!apiKey) {
      throw new Error('BREVO_API_KEY mancante.')
    }

    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'prenotazioni@aurooms.it'
    const senderName = process.env.BREVO_SENDER_NAME || 'Aurooms'

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: senderEmail, name: senderName }],
        subject: 'Ping Mensile Brevo - Aurooms',
        htmlContent: '<p>Questa è una email automatica di sistema per mantenere attiva la chiave API di Brevo.</p>',
      }),
    })

    if (!response.ok) {
      throw new Error(`Errore Brevo API: ${response.status}`)
    }

    return NextResponse.json({ success: true, message: 'Ping inviato con successo.' })
  } catch (error) {
    console.error('Errore nel keepalive:', error)
    return NextResponse.json({ error: 'Errore durante il ping' }, { status: 500 })
  }
}