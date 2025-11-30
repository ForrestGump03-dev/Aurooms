import Link from 'next/link'
import Image from 'next/image'
import { Button } from './ui/button'
import { MapPin, Plane, Star } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/samuel-ferrara-uNvgvo2cs7k-unsplash.jpg"
          alt="Beautiful view of Cinisi coastline, Sicily"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <div className="flex items-center justify-center space-x-1 mb-4">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-gold-400 text-gold-400" />
            ))}
          </div>
          <span className="ml-2 text-gold-200">Luxury Guest House</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 text-balance leading-tight">
          Welcome to <span className="text-gold-400">AuRooms</span>
        </h1>
        
        <p className="text-xl sm:text-2xl mb-4 text-gray-200 max-w-2xl mx-auto text-balance">
          Your luxury escape in the heart of Sicily, just minutes from Palermo Airport
        </p>
        
        <div className="flex items-center justify-center space-x-6 mb-8 text-sm sm:text-base">
          <div className="flex items-center space-x-2">
            <Plane className="w-5 h-5 text-gold-400" />
            <span>3km from Airport</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-gold-400" />
            <span>Cinisi, Sicily</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link href="/booking">
            <Button size="xl" variant="secondary" className="w-full sm:w-auto text-lg px-8 py-4">
              Book Your Stay
            </Button>
          </Link>
          <Link href="/rooms">
            <Button size="xl" variant="outline" className="w-full sm:w-auto text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-gray-900">
              View Rooms
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}