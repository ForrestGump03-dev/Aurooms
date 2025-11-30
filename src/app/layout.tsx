import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import StructuredData from '@/components/StructuredData'
import CookieBanner from '@/components/CookieBanner'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata: Metadata = {
  metadataBase: new URL('https://aurooms.it'),
  title: {
    default: 'AuRooms - Luxury Guest House Cinisi | Near Palermo Airport',
    template: '%s | AuRooms'
  },
  description: 'Experience authentic Sicilian luxury at AuRooms Guest House. Located in Piazza Pietro Venuti, Cinisi, just 3km from Palermo Airport. Premium rooms, stunning views, and exceptional hospitality near beaches and Palermo.',
  keywords: ['Sicily hotel', 'Cinisi accommodation', 'Palermo airport hotel', 'luxury guest house Sicily', 'Sicily vacation rental', 'Piazza Pietro Venuti', 'Cinisi guest house', 'Sicily accommodation', 'Palermo beach hotel', 'Sicily rooms', 'Italian guest house', 'Sicily lodging', 'Cinisi PA hotel'],
  authors: [{ name: 'AuRooms Guest House' }],
  creator: 'Alessio Forestieri',
  publisher: 'AuRooms Guest House',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['it_IT'],
    url: 'https://aurooms.it',
    siteName: 'AuRooms Guest House',
    title: 'AuRooms - Luxury Guest House Cinisi | Near Palermo Airport',
    description: 'Experience authentic Sicilian luxury at AuRooms. Premium rooms near Palermo Airport with stunning views, exceptional service, and easy access to Sicily\'s beautiful beaches.',
    images: [
      {
        url: '/logo_aurooms.png',
        width: 1200,
        height: 630,
        alt: 'AuRooms Guest House - Luxury Accommodation in Sicily',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AuRooms - Luxury Guest House Cinisi | Near Palermo Airport',
    description: 'Experience authentic Sicilian luxury just 3km from Palermo Airport. Premium rooms, stunning views, exceptional hospitality.',
    images: ['/logo_aurooms.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
    shortcut: '/favicon.ico',
  },
  verification: {
    // Aggiungi i codici di verifica quando disponibili
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="canonical" href="https://aurooms.it" />
        <StructuredData />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <CookieBanner />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
