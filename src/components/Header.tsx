'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X, MapPin } from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
              <Image 
                src="/logo_aurooms.png" 
                alt="AuRooms Logo" 
                width={40} 
                height={40}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <span className="font-serif font-bold text-xl text-gray-900">AuRooms</span>
              <div className="flex items-center text-xs text-gray-500">
                <MapPin className="w-3 h-3 mr-1" aria-hidden="true" />
                <span>Cinisi, Sicily</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary-600 transition-colors">
              Home
            </Link>
            <Link href="/rooms" className="text-gray-700 hover:text-primary-600 transition-colors">
              Rooms
            </Link>
            <Link href="/#services" className="text-gray-700 hover:text-primary-600 transition-colors">
              Services
            </Link>
            <Link href="/#location" className="text-gray-700 hover:text-primary-600 transition-colors">
              Location
            </Link>
            <Link href="/#contact" className="text-gray-700 hover:text-primary-600 transition-colors">
              Contact
            </Link>
            <Link 
              href="/booking" 
              className="bg-gold-500 text-white px-4 py-2 rounded-lg hover:bg-gold-600 transition-colors font-medium"
            >
              Book Now
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div id="mobile-menu" className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-700 hover:text-primary-600 transition-colors">
                Home
              </Link>
              <Link href="/rooms" className="text-gray-700 hover:text-primary-600 transition-colors">
                Rooms
              </Link>
              <Link href="/#services" className="text-gray-700 hover:text-primary-600 transition-colors">
                Services
              </Link>
              <Link href="/#location" className="text-gray-700 hover:text-primary-600 transition-colors">
                Location
              </Link>
              <Link href="/#contact" className="text-gray-700 hover:text-primary-600 transition-colors">
                Contact
              </Link>
              <Link 
                href="/booking" 
                className="bg-gold-500 text-white px-4 py-2 rounded-lg hover:bg-gold-600 transition-colors font-medium text-center"
              >
                Book Now
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
