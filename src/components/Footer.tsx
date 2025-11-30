import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Mail, Plane, Star } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                <Image 
                  src="/logo_aurooms.png" 
                  alt="AuRooms Logo" 
                  width={40} 
                  height={40}
                  className="object-contain"
                />
              </div>
              <span className="font-serif font-bold text-xl">AuRooms</span>
            </div>
            <p className="text-gray-400 text-sm">
              Experience authentic Sicilian luxury just 3km from Palermo Airport. 
              Your perfect gateway to discovering the beauty of Sicily.
            </p>
            <div className="flex items-center space-x-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold-400 text-gold-400" />
                ))}
              </div>
              <span className="text-sm text-gray-400 ml-2">4.9/5 Guest Rating</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/rooms" className="text-gray-400 hover:text-white transition-colors">Rooms & Suites</Link></li>
              <li><Link href="/#services" className="text-gray-400 hover:text-white transition-colors">Services</Link></li>
              <li><Link href="/#location" className="text-gray-400 hover:text-white transition-colors">Location</Link></li>
              <li><Link href="/booking" className="text-gray-400 hover:text-white transition-colors">Book Now</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <a 
                  href="https://maps.app.goo.gl/GyEnYbbnxYT872uA9" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 text-sm hover:text-gold-400 transition-colors"
                >
                  Piazza Pietro Venuti, 12, 90045 Cinisi PA
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <span className="text-gray-400 text-sm">+39 375 884 3175</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <span className="text-gray-400 text-sm">info@aurooms.it</span>
              </li>
              <li className="flex items-center space-x-2">
                <Plane className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <span className="text-gray-400 text-sm">3km from Palermo Airport</span>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Services</h3>
            <ul className="space-y-2">
              <li><span className="text-gray-400 text-sm">Airport Transfer</span></li>
              <li><span className="text-gray-400 text-sm">Sicilian Breakfast</span></li>
              <li><span className="text-gray-400 text-sm">Concierge Service</span></li>
              <li><span className="text-gray-400 text-sm">Tour Booking</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              Website designed and developed by{' '}
              <a 
                href="https://wa.me/393500082907" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gold-400 transition-colors font-medium"
              >
                Alessio Forestieri
              </a>
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}