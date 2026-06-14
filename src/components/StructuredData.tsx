import { getAvailableRooms } from '@/lib/rooms'
import { fullAddress, getSiteSettings } from '@/lib/site-settings'

export default async function StructuredData() {
  const settings = await getSiteSettings()
  const rooms = await getAvailableRooms().catch(error => {
    console.error('Failed to load structured data rooms:', error)
    return []
  })

  const sameAs = [settings.facebookUrl, settings.instagramUrl].filter(Boolean)
  const businessUrl = settings.websiteUrl.replace(/\/$/, '')

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    '@id': `${businessUrl}/#hotel`,
    name: settings.businessName,
    alternateName: settings.shortName,
    description: settings.description,
    url: businessUrl,
    telephone: settings.phoneDisplay,
    email: settings.email,
    priceRange: '€€',
    starRating: {
      '@type': 'Rating',
      ratingValue: '4.9',
      bestRating: '5',
    },
    image: `${businessUrl}/logo_aurooms.png`,
    logo: `${businessUrl}/logo_aurooms.png`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.addressLine,
      addressLocality: settings.city,
      addressRegion: settings.province,
      postalCode: settings.postalCode,
      addressCountry: 'IT',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 38.1517,
      longitude: 13.0995,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: settings.checkInTime,
      closes: '23:00',
    },
    checkinTime: settings.checkInTime,
    checkoutTime: settings.checkOutTime,
    amenityFeature: [
      { '@type': 'LocationFeatureSpecification', name: 'Free WiFi', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Air Conditioning', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Airport Transfer', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Breakfast', value: true },
    ],
    containsPlace: rooms.map(room => ({
      '@type': 'Accommodation',
      name: room.name,
      description: room.description,
      occupancy: {
        '@type': 'QuantitativeValue',
        maxValue: room.maxGuests,
      },
    })),
    sameAs,
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: businessUrl },
      { '@type': 'ListItem', position: 2, name: 'Rooms', item: `${businessUrl}/rooms` },
      { '@type': 'ListItem', position: 3, name: 'Booking', item: `${businessUrl}/booking` },
    ],
  }

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${businessUrl}/#organization`,
    name: settings.businessName,
    url: businessUrl,
    logo: `${businessUrl}/logo_aurooms.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: settings.phoneDisplay,
      contactType: 'Customer Service',
      email: settings.email,
      availableLanguage: ['English', 'Italian'],
      areaServed: 'IT',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.addressLine,
      addressLocality: settings.city,
      addressRegion: settings.province,
      postalCode: settings.postalCode,
      addressCountry: 'IT',
    },
    description: fullAddress(settings),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
    </>
  )
}
