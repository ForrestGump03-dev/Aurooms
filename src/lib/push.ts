import webpush from 'web-push'
import { query } from './db'

export interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: Record<string, unknown>
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

interface WebPushError extends Error {
  statusCode?: number
}

function configureVapid() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT || 'mailto:prenotazioni@aurooms.it'

  if (!publicKey || !privateKey) {
    throw new Error('VAPID keys are not configured')
  }

  webpush.setVapidDetails(subject, publicKey, privateKey)
}

function getAdminDashboardUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aurooms.it'
  return `${baseUrl.replace(/\/$/, '')}/admin/dashboard`
}

export async function sendPushNotification(
  payload: PushNotificationPayload
): Promise<{ sent: number; failed: number }> {
  try {
    configureVapid()

    const result = await query(
      'SELECT id, endpoint, p256dh_key, auth_key FROM push_subscriptions'
    )

    if (result.rows.length === 0) {
      return { sent: 0, failed: 0 }
    }

    let sent = 0
    let failed = 0
    const expiredSubscriptionIds: number[] = []

    await Promise.all(result.rows.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh_key,
          auth: sub.auth_key,
        },
      }

      try {
        await webpush.sendNotification(pushSubscription, JSON.stringify(payload))
        sent++
      } catch (error) {
        failed++
        const pushError = error as WebPushError

        if (pushError.statusCode === 404 || pushError.statusCode === 410) {
          expiredSubscriptionIds.push(sub.id)
        } else {
          console.error('Push notification failed:', pushError.message)
        }
      }
    }))

    if (expiredSubscriptionIds.length > 0) {
      await query(
        'DELETE FROM push_subscriptions WHERE id = ANY($1)',
        [expiredSubscriptionIds]
      )
    }

    return { sent, failed }
  } catch (error) {
    console.error('Push notification error:', error)
    throw error
  }
}

export async function sendNewBookingNotification(
  bookingData: BookingNotificationData
): Promise<void> {
  await sendPushNotification({
    title: 'Nuova prenotazione',
    body: `${bookingData.guestName} ha prenotato ${bookingData.roomType}`,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: {
      url: getAdminDashboardUrl(),
      bookingId: bookingData.bookingId,
      bookingNumber: bookingData.bookingNumber,
      guestName: bookingData.guestName,
      roomType: bookingData.roomType,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      totalAmount: bookingData.totalAmount,
    },
  })
}

export async function sendTestNotification(): Promise<{ sent: number; failed: number }> {
  return sendPushNotification({
    title: 'Test notifica',
    body: 'Le notifiche push funzionano correttamente!',
    icon: '/favicon.ico',
    data: {
      url: getAdminDashboardUrl(),
    },
  })
}
