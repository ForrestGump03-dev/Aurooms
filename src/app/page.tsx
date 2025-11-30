import Hero from '@/components/Hero'
import RoomCard from '@/components/RoomCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Plane, 
  MapPin, 
  Wifi, 
  Coffee, 
  Utensils, 
  Shield, 
  Clock,
  Star,
  Quote,
  Phone,
  Mail
} from 'lucide-react'
import { query } from '@/lib/db'
import { Room } from '@/types'

async function getFeaturedRooms(): Promise<Room[]> {
  try {
    // Select a few featured rooms (adjust ORDER/LIMIT as needed)
    const res = await query('SELECT id, name, type, description, price_per_night, max_guests, size, bed_type, amenities, image_urls, available FROM rooms WHERE available = true ORDER BY price_per_night ASC LIMIT 3')
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
      imageUrls: Array.isArray(r.image_urls) && r.image_urls.length ? r.image_urls : ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=2070'],
      available: r.available
    }) as Room)
  } catch (error) {
    console.error('Failed to load featured rooms:', error)
    return []
  }
}

const services = [
  {
    icon: Plane,
    title: 'Airport Transfer',
    description: '30€ shuttle service to and from Palermo Airport, for a hassle-free start to your stay. Contact us to arrange your pickup.'
  },
  {
    icon: Utensils,
    title: 'Sicilian Breakfast',
    description: 'Start your day with authentic local delicacies and fresh Mediterranean flavors.'
  },
  {
    icon: Shield,
    title: 'Concierge Service',
    description: 'Our local experts help you discover the best of Cinisi and surrounding areas.'
  },
  {
    icon: Wifi,
    title: 'High-Speed WiFi',
    description: 'Stay connected with complimentary high-speed internet throughout the property.'
  },
  {
    icon: Clock,
    title: '15:00-21:00 Check-In',
    description: 'Flexible check-in hours to accommodate your travel schedule. For info outside these hours, please contact us directly.'
  }
]

const testimonials = [
  {
    name: 'Sarah Johnson',
    location: 'London, UK',
    rating: 5,
    text: 'AuRooms exceeded all our expectations! The location is perfect for exploring Sicily, and the hospitality was exceptional. The room was beautifully designed with authentic Sicilian touches.',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=150'
  },
  {
    name: 'Marco Rossi',
    location: 'Milan, Italy',
    rating: 5,
    text: 'Perfect location near the airport but far enough to feel peaceful. The staff went above and beyond to make our anniversary special. Highly recommend the Junior Suite!',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150'
  },
  {
    name: 'Emma Thompson',
    location: 'New York, USA',
    rating: 5,
    text: 'The attention to detail is remarkable. From the welcome drink to the personalized recommendations, AuRooms made our Sicilian adventure unforgettable.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150'
  }
]

export default async function HomePage() {
  const featuredRooms = await getFeaturedRooms()
  return (
    <>
      <Hero />
      
      {/* Why Choose AuRooms */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose AuRooms
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the perfect blend of authentic Sicilian hospitality and modern luxury, 
              just minutes from Palermo Airport.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plane className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-2">Prime Location</h3>
              <p className="text-gray-600">
                Just 3km from Palermo Airport with easy access to Sicily&apos;s most beautiful destinations.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-gold-600" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-2">Luxury Comfort</h3>
              <p className="text-gray-600">
                Premium amenities and elegant design create the perfect sanctuary for your Sicilian escape.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-sand-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-sand-600" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-2">Authentic Experience</h3>
              <p className="text-gray-600">
                Immerse yourself in genuine Sicilian culture with our local insights and personalized service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Luxury Rooms
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Each room is thoughtfully designed to provide comfort, elegance, and authentic Sicilian charm.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>

          <div className="text-center">
            <Link href="/rooms">
              <Button size="lg" variant="outline">
                View All Rooms
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Premium Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Enjoy exceptional amenities and personalized services designed to make your stay unforgettable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <service.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section id="location" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Discover <span className="text-primary-600">Cinisi</span>
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Located in the heart of Sicily&apos;s northwest coast, Cinisi offers the perfect blend of 
                coastal beauty, historical charm, and modern convenience. Our strategic location puts 
                you just minutes away from both Palermo Airport and some of Sicily&apos;s most stunning attractions.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  <span className="text-gray-700"><strong>3km</strong> to Palermo Airport</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  <span className="text-gray-700"><strong>30km</strong> to Palermo city center</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  <span className="text-gray-700"><strong>25km</strong> to Mondello Beach</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  <span className="text-gray-700"><strong>45km</strong> to Monreale Cathedral</span>
                </div>
              </div>

              <Link href="#contact">
                <Button size="lg" variant="secondary">
                  Get Directions
                </Button>
              </Link>
            </div>

            <div className="relative h-96 lg:h-full rounded-xl overflow-hidden">
              <Image
                src="/sicilia_night.png"
                alt="Beautiful coastline of Cinisi, Sicily"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Guest Experiences
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover why our guests choose to return to AuRooms for their Sicilian adventures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold-400 text-gold-400" />
                    ))}
                  </div>
                  
                  <Quote className="w-6 h-6 text-gray-400 mb-3" />
                  <p className="text-gray-600 mb-6 italic">&ldquo;{testimonial.text}&rdquo;</p>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-700 font-semibold text-sm">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-6">
                Ready to Experience Sicily?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Book your stay at AuRooms and discover the magic of authentic Sicilian hospitality.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gold-400 flex-shrink-0" />
                  <span className="text-gray-300">
                    Piazza Pietro Venuti, 12, 90045 Cinisi PA</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gold-400 flex-shrink-0" />
                  <span className="text-gray-300">+39 375 884 3175</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gold-400 flex-shrink-0" />
                  <span className="text-gray-300">info@aurooms.it</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Plane className="w-5 h-5 text-gold-400 flex-shrink-0" />
                  <span className="text-gray-300">Just 3km from Palermo Airport</span>
                </div>
              </div>

              <div className="mt-8">
                <Link href="/booking">
                  <Button size="xl" variant="secondary" className="mr-4">
                    Book Now
                  </Button>
                </Link>
                <Link href="tel:+393758843175">
                  <Button size="xl" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                    Call Us
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative h-96 lg:h-full rounded-xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1555881400-74d7acaacd8b?q=80&w=2070"
                alt="Cinisi at sunset with Mount Pellegrino in the background"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}