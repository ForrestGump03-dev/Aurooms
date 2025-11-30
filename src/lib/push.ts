// Utility per inviare notifiche push Web Push API
import webpush from 'web-push'
import { query } from './db'

// Configurazione VAPID (Voluntary Application Server Identification)
// Genera chiavi con: npx web-push generate-vapid-keys
const vapidDetails = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || '',
  subject: process.env.VAPID_SUBJECT || 'mailto:admin@aurooms.it'
}

if (vapidDetails.publicKey && vapidDetails.privateKey) {
  webpush.setVapidDetails(
    vapidDetails.subject,
    vapidDetails.publicKey,
    vapidDetails.privateKey
  )
}

export interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: any
}

export interface BookingNotificationData {
  bookingId: number
  bookingNumber: string
  guestName: string
  roomType: string
  checkIn: string
  checkOut: string
  totalAmount: number
}

/**
 * Invia notifica push a tutti i dispositivi registrati
 */
export async function sendPushNotification(
  payload: PushNotificationPayload
): Promise<{ sent: number; failed: number }> {
  try {
    // Recupera tutte le subscriptions attive
    const result = await query(
      'SELECT id, endpoint, p256dh_key, auth_key FROM push_subscriptions'
    )

    const subscriptions = result.rows

    if (subscriptions.length === 0) {
      console.log('⚠️ Nessuna subscription attiva per le notifiche push')
      return { sent: 0, failed: 0 }
    }

    console.log(`📤 Invio notifica a ${subscriptions.length} dispositivi...`)

    let sent = 0
    let failed = 0
    const failedEndpoints: number[] = []

    // Invia notifica a ogni subscription
    const promises = subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh_key,
          auth: sub.auth_key
        }
      }

      try {
        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify(payload)
        )
        sent++
        console.log(`  ✅ Notifica inviata a: ${sub.endpoint.substring(0, 50)}...`)
      } catch (error: any) {
        failed++
        console.error(`  ❌ Errore invio a: ${sub.endpoint.substring(0, 50)}...`)
        console.error(`     Motivo: ${error.message}`)

        // Se la subscription è scaduta (410 Gone) o invalida, rimuovila
        if (error.statusCode === 404 || error.statusCode === 410) {
          failedEndpoints.push(sub.id)
          console.log(`     🗑️ Subscription scaduta, verrà rimossa`)
        }
      }
    })

    await Promise.all(promises)

    // Rimuovi subscriptions scadute
    if (failedEndpoints.length > 0) {
      await query(
        `DELETE FROM push_subscriptions WHERE id = ANY($1)`,
        [failedEndpoints]
      )
      console.log(`🗑️ Rimosse ${failedEndpoints.length} subscriptions scadute`)
    }

    console.log(`✅ Notifiche inviate: ${sent} successo, ${failed} fallite`)

    return { sent, failed }

  } catch (error) {
    console.error('❌ Errore nell\'invio delle notifiche push:', error)
    throw error
  }
}

/**
 * Invia notifica per nuova prenotazione
 */
export async function sendNewBookingNotification(
  bookingData: BookingNotificationData
): Promise<void> {
  const payload: PushNotificationPayload = {
    title: ' Nuova Prenotazione!',
    body: `${bookingData.guestName} ha prenotato ${bookingData.roomType}`,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: {
      url: 'https://aurooms.it/admin/dashboard',
      bookingId: bookingData.bookingId,
      bookingNumber: bookingData.bookingNumber,
      guestName: bookingData.guestName,
      roomType: bookingData.roomType,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      totalAmount: bookingData.totalAmount
    }
  }

  await sendPushNotification(payload)
}

/**
 * Test: Invia notifica di prova
 */
export async function sendTestNotification(): Promise<void> {
  const payload: PushNotificationPayload = {
    title: '🔔 Test Notifica',
    body: 'Le notifiche push funzionano correttamente!',
    icon: '/favicon.ico',
    data: {
      url: 'https://aurooms.it/admin/dashboard'
    }
  }

  await sendPushNotification(payload)
}
