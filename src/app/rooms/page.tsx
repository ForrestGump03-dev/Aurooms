import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Wifi, Car, Coffee, Bath, Tv, Phone, Mail, BathIcon } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { query } from '@/lib/db'
import { Room } from '@/types'

export const metadata: Metadata = {
  title: 'Our Rooms & Suites - Premium Accommodation in Cinisi, Sicily',
  description: 'Discover our luxury rooms at AuRooms Guest House. Blue Family Room (4 guests), Glicine Couple Room, and Yellow Couple Room. All with premium amenities, WiFi, AC, and stunning views near Palermo Airport.',
  openGraph: {
    title: 'Luxury Rooms & Suites | AuRooms Guest House Sicily',
    description: 'Explore our elegant rooms in Cinisi, Sicily. Family and couple accommodations with premium amenities just 3km from Palermo Airport.',
    url: 'https://aurooms.it/rooms',
  },
}

async function getRooms(): Promise<Room[]> {
  try {
    const res = await query('SELECT id, name, type, description, price_per_night, max_guests, size, bed_type, amenities, image_urls, available FROM rooms WHERE available = true ORDER BY price_per_night ASC')
    return res.rows.map((r: any) => ({
      id: String(r.id),
      name: r.name,
      type: r.type,
      description: r.description || '',
      pricePerNight: Number(r.price_per_night),
      maxGuests: r.max_guests,
      size: r.size || '',
      bedType: r.bed_type || '',
      amenities: Array.isArray(r.amenities) ? r.amenities : [],
      imageUrls: Array.isArray(r.image_urls) && r.image_urls.length ? r.image_urls : [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=2070'
      ],
      available: r.available
    }) as Room)
  } catch (error) {
    console.error('Failed to fetch rooms in page:', error)
    return []
  }
}

const amenityIcons = {
  'WiFi': Wifi,
  'Air Conditioning': Users,
  'TV': Tv,
  'Mini Bar': Coffee,
  'Private Bathroom': Bath,
  'Parking': Car,
  'Phone': Phone,
  'Safe': Users,
  'Balcony': Users,
  'Premium Bedding': Users,
  'Bathrobe': Users,
  'Living Area': Users,
  'Premium Amenities': Users,
  'Welcome Amenities': Users,
  'Family Setup': Users,
  'Mini Fridge': Users,
  'Extra Space': Users,
  'Child Amenities': Users,
  'Bathroom Amenities': Bath,
}

export default async function RoomsPage() {
  const rooms = await getRooms()
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative h-96 bg-gray-900 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=2070"
          alt="Luxury room at AuRooms"
          fill
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-3xl px-4">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-4">
              Luxury Rooms & Suites
            </h1>
            <p className="text-xl text-gray-200">
              Discover elegantly appointed accommodations designed for comfort, style, and authentic Sicilian hospitality
            </p>
          </div>
        </div>
      </section>

      {/* Rooms Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {rooms.map((room, index) => (
              <div key={room.id} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                {/* Images */}
                <div className={`${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                  <div className="grid grid-cols-2 gap-4 h-96">
                    <div className="relative rounded-xl overflow-hidden col-span-2 lg:col-span-1">
                      <Image
                        src={room.imageUrls[0]}
                        alt={`${room.name} - Main view`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {/* Show second image only if it exists and room is not Yellow Room */}
                    {room.imageUrls[1] && room.name !== 'Yellow Room' && (
                      <div className="relative rounded-xl overflow-hidden col-span-2 lg:col-span-1">
                        <Image
                          src={room.imageUrls[1]}
                          alt={`${room.name} - Detail view`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Room Details */}
                <div className={`${index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                  <Card className="border-0 shadow-none">
                    <CardHeader className="px-0">
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="font-serif text-3xl">{room.name}</CardTitle>
                        <span className="bg-gold-100 text-gold-800 px-3 py-1 rounded-full text-sm font-medium">
                          {formatCurrency(room.pricePerNight)}/night
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-gray-600 text-sm">
                        <span>• {room.size}</span>
                        <span>• Up to {room.maxGuests} guests</span>
                        <span>• {room.bedType}</span>
                      </div>
                    </CardHeader>

                    <CardContent className="px-0">
                      <p className="text-gray-700 text-lg leading-relaxed mb-6">
                        {room.description}
                      </p>

                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Room Amenities</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {room.amenities.map((amenity, index) => {
                            const IconComponent = amenityIcons[amenity as keyof typeof amenityIcons] || Users
                            return (
                              <div key={index} className="flex items-center space-x-2 text-gray-600">
                                <IconComponent className="w-4 h-4 text-primary-600" />
                                <span className="text-sm">{amenity}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <Link href="/booking">
                          <Button size="lg" variant="secondary">
                            Book This Room
                          </Button>
                        </Link>
                        <Link href="https://wa.me/393758843175">
                          <Button size="lg" variant="outline">
                            Ask Questions
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
            Ready to Book Your Perfect Room?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Experience luxury, comfort, and authentic Sicilian hospitality at AuRooms. 
            Book now for the best rates and exclusive benefits.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/booking">
              <Button size="xl" variant="secondary">
                Book Your Stay
              </Button>
            </Link>
            <Link href="tel:+393758843175">
              <Button size="xl" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600">
                Call for Reservations
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}