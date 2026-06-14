import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import StructuredData from '@/components/StructuredData'
import CookieBanner from '@/components/CookieBanner'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { getSiteSettings } from '@/lib/site-settings'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()

  return {
  metadataBase: new URL('https://aurooms.it'),
  title: {
    default: `${settings.shortName} - Luxury Guest House ${settings.city} | Near Palermo Airport`,
    template: `%s | ${settings.shortName}`
  },
  description: settings.description,
  alternates: {
    canonical: settings.websiteUrl,
  },
  keywords: ['Sicily hotel', `${settings.city} accommodation`, 'Palermo airport hotel', 'luxury guest house Sicily', 'Sicily vacation rental', `${settings.city} guest house`, 'Sicily accommodation', 'Palermo beach hotel', 'Sicily rooms', 'Italian guest house', 'Sicily lodging'],
  authors: [{ name: settings.businessName }],
  creator: 'Alessio Forestieri',
  publisher: settings.businessName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['it_IT'],
    url: settings.websiteUrl,
    siteName: settings.businessName,
    title: `${settings.shortName} - Luxury Guest House ${settings.city} | Near Palermo Airport`,
    description: settings.description,
    images: [
      {
        url: '/logo_aurooms.png',
        width: 1200,
        height: 630,
        alt: `${settings.businessName} - Luxury Accommodation in Sicily`,
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${settings.shortName} - Luxury Guest House ${settings.city} | Near Palermo Airport`,
    description: settings.description,
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
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
