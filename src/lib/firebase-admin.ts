import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getMessaging } from 'firebase-admin/messaging'

if (!getApps().length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  if (serviceAccount) {
    initializeApp({
      credential: cert(JSON.parse(serviceAccount)),
    })
  }
}

export async function enviarPushNotification(
  token: string,
  titulo: string,
  corpo: string,
  url?: string
): Promise<boolean> {
  try {
    const messaging = getMessaging()
    await messaging.send({
      token,
      notification: {
        title: titulo,
        body: corpo,
      },
      webpush: {
        notification: {
          title: titulo,
          body: corpo,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
        },
        fcmOptions: {
          link: url || 'https://fretes-pro-cv53.vercel.app/solicitar',
        },
      },
    })
    return true
  } catch (err) {
    console.error('Erro ao enviar push FCM:', err)
    return false
  }
}
