import type { Metadata, Viewport } from 'next'

export const viewport: Viewport = {
  themeColor: '#f97316',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'Solicitar Frete — Fretes IA Log',
  description: 'Solicite fretes locais de forma rápida. Conectamos você aos melhores motoristas da região.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Fretes IA Log',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
  openGraph: {
    title: 'Fretes IA Log — Seu frete, na hora certa',
    description: 'Solicite fretes locais de forma rápida e fácil.',
    type: 'website',
  },
}

export default function SolicitarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
