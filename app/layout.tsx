import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

import { Providers } from '@/components/Providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Ver Fútbol EN VIVO Gratis | Partidos de Hoy',
  description: 'Ver fútbol EN VIVO gratis. Partidos de hoy con links de streaming, horarios por país y marcadores en tiempo real.',
  openGraph: {
    siteName: 'Ver Fútbol EN VIVO Gratis',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='es'>
      <head>
        <link
          href='https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;800;900&display=swap'
          rel='stylesheet'
        />
      </head>
      <body className={`${inter.variable} font-inter bg-[#060d1a] text-white min-h-screen overflow-x-hidden`}>
        <div className='bg-stadium fixed inset-0 z-[-1]' />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
