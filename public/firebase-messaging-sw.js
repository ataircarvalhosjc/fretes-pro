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

// Mensagens em background
messaging.onBackgroundMessage((payload) => {
  const data = payload.data || {}

  // --- Notificação para MOTORISTA com botões Aceitar / Recusar ---
  if (data.type === 'novo_frete') {
    const title = '🚛 Novo frete disponível!'
    const body = `📍 ${data.origem} → ${data.destino}${data.tipoVeiculo ? '\n🚚 ' + data.tipoVeiculo : ''}${data.descricao ? '\n📦 ' + data.descricao : ''}`

    self.registration.showNotification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      vibrate: [200, 100, 200, 100, 200],
      requireInteraction: true, // mantém a notificação até o usuário interagir
      actions: [
        { action: 'aceitar', title: '✅ Aceitar frete' },
        { action: 'recusar', title: '❌ Recusar' },
      ],
      data: {
        type: 'novo_frete',
        orcamentoId: data.orcamentoId,
        motoristaId: data.motoristaId,
        url: self.location.origin + '/motorista/fretes',
      },
      tag: 'frete-' + data.orcamentoId, // evita notificações duplicadas
    })
    return
  }

  // --- Notificação genérica (cliente / status) ---
  const title = payload.notification?.title || 'Fretes IA Log'
  const body = payload.notification?.body || ''
  self.registration.showNotification(title, {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { url: data.url || '/' },
    vibrate: [200, 100, 200],
  })
})

// Clique na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const notifData = event.notification.data || {}

  // Motorista clicou em Aceitar ou Recusar
  if (notifData.type === 'novo_frete') {
    const { orcamentoId, motoristaId } = notifData

    if (event.action === 'aceitar' || event.action === 'recusar') {
      event.waitUntil(
        fetch('/api/resposta-motorista', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orcamentoId,
            motoristaId,
            resposta: event.action,
          }),
        }).then(() => {
          // Mostra confirmação
          const msg = event.action === 'aceitar'
            ? '✅ Você aceitou o frete! Em breve entraremos em contato.'
            : '❌ Frete recusado. Aguarde os próximos.'
          return self.registration.showNotification('Fretes IA Log', {
            body: msg,
            icon: '/icons/icon-192.png',
            tag: 'resposta-' + orcamentoId,
          })
        })
      )
      return
    }
  }

  // Clique no corpo da notificação → abre URL
  const url = notifData.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) return client.focus()
      }
      return clients.openWindow(url)
    })
  )
})
