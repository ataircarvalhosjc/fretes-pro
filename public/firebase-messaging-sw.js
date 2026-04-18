importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyDEMKkCrqKsL23C_0pMwOPXXJ62a3BqxHA',
  authDomain: 'fretes-ia-log.firebaseapp.com',
  projectId: 'fretes-ia-log',
  storageBucket: 'fretes-ia-log.firebasestorage.app',
  messagingSenderId: '48121888946',
  appId: '1:48121888946:web:c4e4fbbda43c61c616c9ab',
})

const messaging = firebase.messaging()

// Notificações recebidas com o app em background
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'Fretes IA Log'
  const body = payload.notification?.body || ''
  const icon = payload.notification?.icon || '/icons/icon-192.png'

  self.registration.showNotification(title, {
    body,
    icon,
    badge: '/icons/icon-192.png',
    data: payload.data || {},
    vibrate: [200, 100, 200],
  })
})

// Ao clicar na notificação, abre o link de rastreamento
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus()
      }
      return clients.openWindow(url)
    })
  )
})
