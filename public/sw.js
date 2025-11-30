// Service Worker per gestire notifiche push
// Funziona anche quando il browser è chiuso

const APP_NAME = 'AuRooms Admin';
const NOTIFICATION_ICON = '/favicon.ico';

// Installazione Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installato');
  self.skipWaiting();
});

// Attivazione Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Attivato');
  event.waitUntil(clients.claim());
});

// Gestione messaggi push
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push ricevuto:', event);

  let notificationData = {
    title: 'Nuova Prenotazione!',
    body: 'È arrivata una nuova prenotazione su AuRooms',
    icon: NOTIFICATION_ICON,
    badge: NOTIFICATION_ICON,
    tag: 'new-booking',
    requireInteraction: true,
    data: {
      url: 'https://aurooms.it/admin/dashboard'
    }
  };

  // Se il push contiene dati, li usa
  if (event.data) {
    try {
      const data = event.data.json();
      
      if (data.title) notificationData.title = data.title;
      if (data.body) notificationData.body = data.body;
      if (data.bookingNumber) {
        notificationData.body = `Prenotazione #${data.bookingNumber}\n${data.guestName}\nCamera: ${data.roomType}`;
        notificationData.data.bookingId = data.bookingId;
      }
    } catch (e) {
      console.log('[Service Worker] Push senza dati JSON, uso default');
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
      vibrate: [200, 100, 200], // Vibrazione mobile
      actions: [
        {
          action: 'open',
          title: 'Visualizza'
        },
        {
          action: 'close',
          title: 'Chiudi'
        }
      ]
    })
  );
});

// Click su notifica
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Click su notifica:', event.action);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Apri o focus sulla dashboard
  const urlToOpen = event.notification.data?.url || 'https://aurooms.it/admin/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUnowned: true })
      .then((clientList) => {
        // Se c'è già una finestra aperta con la dashboard, focus su quella
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Altrimenti apri nuova finestra
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Gestione errori push
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[Service Worker] Subscription cambiata, re-subscribe necessario');
  
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        'BOGGn3ClqEdl8mIOf_M48G-wqI2jZLvNM_mDJ60d07f4KDhHneA5P_GVTZ_REKYKyNvMtU5203bJvj0dmF87w7g'
      )
    })
    .then((subscription) => {
      console.log('[Service Worker] Re-subscription completata');
      return fetch('/api/admin/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });
    })
  );
});

// Utility per convertire VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
