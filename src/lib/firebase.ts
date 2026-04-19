import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: 'AIzaSyDEMKkCrqKsL23C_0pMwOPXXJ62a3BqxHA',
  authDomain: 'fretes-ia-log.firebaseapp.com',
  projectId: 'fretes-ia-log',
  storageBucket: 'fretes-ia-log.firebasestorage.app',
  messagingSenderId: '48121888946',
  appId: '1:48121888946:web:c4e4fbbda43c61c616c9ab',
}

const VAPID_KEY = 'BLQlkWE3dPzCPk-ZXB1KSNsuzfhNLrwin5mAUzrTXhAIzVA182FQt6tmfVjVTxXw1IL70cqdzw95MXhN8xfc9_w'

export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export async function pedirPermissaoNotificacao(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  if (!('Notification' in window)) return null

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return null

    // Registra o service worker do FCM
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')

    const messaging = getMessaging(firebaseApp)
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    })

    return token || null
  } catch (err) {
    console.error('Erro ao obter token FCM:', err)
    return null
  }
}

export function ouvirNotificacoesEmPrimeiroPLano() {
  if (typeof window === 'undefined') return
  try {
    const messaging = getMessaging(firebaseApp)
    onMessage(messaging, (payload) => {
      const { title, body } = payload.notification || {}
      if (title && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body: body || '',
          icon: '/icons/icon-192.png',
        })
      }
    })
  } catch {
    // ignora em SSR ou browsers sem suporte
  }
}
