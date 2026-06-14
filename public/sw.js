const NOTIFICATION_ICON = '/favicon.ico';
const DEFAULT_ADMIN_URL = 'https://aurooms.it/admin/dashboard';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  let payload = {};

  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = {};
    }
  }

  const data = payload.data || {};
  const bookingNumber = data.bookingNumber || payload.bookingNumber;
  const guestName = data.guestName || payload.guestName;
  const roomType = data.roomType || payload.roomType;

  const title = payload.title || 'Nuova prenotazione';
  const body = bookingNumber
    ? `Prenotazione #${bookingNumber}\n${guestName || ''}\nCamera: ${roomType || ''}`
    : payload.body || 'E arrivata una nuova prenotazione su AuRooms';

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: payload.icon || NOTIFICATION_ICON,
      badge: payload.badge || NOTIFICATION_ICON,
      tag: bookingNumber ? `booking-${bookingNumber}` : 'new-booking',
      requireInteraction: true,
      data: {
        url: data.url || DEFAULT_ADMIN_URL,
        ...data,
      },
      vibrate: [200, 100, 200],
      actions: [
        {
          action: 'open',
          title: 'Visualizza',
        },
        {
          action: 'close',
          title: 'Chiudi',
        },
      ],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || DEFAULT_ADMIN_URL;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUnowned: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
