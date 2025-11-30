export default function StructuredData() {
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    '@id': 'https://aurooms.it/#hotel',
    name: 'AuRooms Guest House',
    alternateName: 'AuRooms',
    description: 'Luxury guest house in Cinisi, Sicily, just 3km from Palermo Airport. Premium accommodation with stunning views and exceptional Sicilian hospitality.',
    url: 'https://aurooms.it',
    telephone: '+39-375-884-3175',
    email: 'info@aurooms.it',
    priceRange: '€€',
    starRating: {
      '@type': 'Rating',
      ratingValue: '4.9',
      bestRating: '5'
    },
    image: 'https://aurooms.it/logo_aurooms.png',
    logo: 'https://aurooms.it/logo_aurooms.png',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Piazza Pietro Venuti, 12',
      addressLocality: 'Cinisi',
      addressRegion: 'PA',
      postalCode: '90045',
      addressCountry: 'IT'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 38.1517,
      longitude: 13.0995
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
      ],
      opens: '15:00',
      closes: '23:00'
    },
    checkinTime: '15:00',
    checkoutTime: '11:00',
    amenityFeature: [
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Free WiFi',
        value: true
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Air Conditioning',
        value: true
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Airport Transfer',
        value: true
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Breakfast',
        value: true
      }
    ],
    containsPlace: [
      {
        '@type': 'Accommodation',
        name: 'Blue Room',
        description: 'Family room with premium amenities',
        occupancy: {
          '@type': 'QuantitativeValue',
          maxValue: 4
        }
      },
      {
        '@type': 'Accommodation',
        name: 'Glicine Room',
        description: 'Couple room with elegant design',
        occupancy: {
          '@type': 'QuantitativeValue',
          maxValue: 2
        }
      },
      {
        '@type': 'Accommodation',
        name: 'Yellow Room',
        description: 'Couple room with modern comfort',
        occupancy: {
          '@type': 'QuantitativeValue',
          maxValue: 2
        }
      }
    ],
    sameAs: [
      // Aggiungi qui i link ai profili social se disponibili
      // 'https://www.facebook.com/aurooms',
      // 'https://www.instagram.com/aurooms',
    ]
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://aurooms.it'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Rooms',
        item: 'https://aurooms.it/rooms'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Booking',
        item: 'https://aurooms.it/booking'
      }
    ]
  }

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://aurooms.it/#organization',
    name: 'AuRooms Guest House',
    url: 'https://aurooms.it',
    logo: 'https://aurooms.it/logo_aurooms.png',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+39-375-884-3175',
      contactType: 'Customer Service',
      email: 'info@aurooms.it',
      availableLanguage: ['English', 'Italian'],
      areaServed: 'IT'
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Piazza Pietro Venuti, 12',
      addressLocality: 'Cinisi',
      addressRegion: 'Sicily',
      postalCode: '90045',
      addressCountry: 'IT'
    }
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
