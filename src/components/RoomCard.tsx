import Image from 'next/image'
import Link from 'next/link'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Users, Wifi, Car, Coffee } from 'lucide-react'
import { Room } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface RoomCardProps {
  room: Room
}

export default function RoomCard({ room }: RoomCardProps) {
  const amenityIcons = {
    'WiFi': Wifi,
    'Parking': Car,
    'Breakfast': Coffee,
    'Air Conditioning': Users,
  }

  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2">
      <div className="relative h-64 overflow-hidden">
        <Image
          src={room.imageUrls[0]}
          alt={room.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute top-4 right-4">
          <span className="bg-gold-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            {formatCurrency(room.pricePerNight)}/night
          </span>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-serif text-xl font-semibold text-gray-900">{room.name}</h3>
          <div className="flex items-center space-x-1 text-gray-600">
            <Users className="w-4 h-4" />
            <span className="text-sm">Up to {room.maxGuests}</span>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">{room.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {room.amenities.slice(0, 4).map((amenity, index) => {
            const IconComponent = amenityIcons[amenity as keyof typeof amenityIcons] || Wifi
            return (
              <div key={index} className="flex items-center space-x-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                <IconComponent className="w-3 h-3" />
                <span>{amenity}</span>
              </div>
            )
          })}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Starting from <span className="font-semibold text-gray-900">{formatCurrency(room.pricePerNight)}</span>
          </div>
          <Link href="/booking">
            <Button size="sm" variant="secondary">
              Book Now
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}