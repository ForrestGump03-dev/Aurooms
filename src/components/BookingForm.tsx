'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Calendar, Users, CreditCard, Check } from 'lucide-react'
import { formatCurrency, calculateNights } from '@/lib/utils'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// Fallback options in case the API is unreachable; kept to avoid breaking existing UX
const ROOM_TYPES_FALLBACK = [
  { id: 'couple', name: 'Yellow Room', price: 65 },
  { id: 'couple2', name: 'Glicine Room', price: 65 },
  { id: 'family', name: 'Blue Room', price: 100 }
]

function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkIn: '',
    checkOut: '',
    guestsCount: 1,
    roomType: '',
    specialRequests: '',
  })

  // roomOptions will be populated from the API; fall back to ROOM_TYPES_FALLBACK
  type RoomOption = { 
    id: string
    roomId?: number
    type?: string
    name: string
    price: number
    available?: boolean
    maxGuests?: number
  }
  const [roomOptions, setRoomOptions] = useState<RoomOption[]>(ROOM_TYPES_FALLBACK as RoomOption[])
  const [maxGuests, setMaxGuests] = useState(4)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/rooms')
        if (!res.ok) return
        const data = await res.json()
        const rooms = Array.isArray(data?.rooms) ? data.rooms : Array.isArray(data) ? data : []
        const options = rooms.map((r: any) => ({
          id: String(r.id),
          roomId: Number(r.id),
          type: r.type,
          name: r.name || (r.type || 'Room'),
          price: Number(r.pricePerNight ?? r.price_per_night ?? 0),
          available: true,
          maxGuests: Number(r.maxGuests ?? r.max_guests ?? 1),
        }))

        if (mounted && options.length) {
          setRoomOptions(options)
          setMaxGuests(Math.max(1, ...options.map((o: RoomOption) => o.maxGuests || 1)))
          setFormData(prev => options.some((option: RoomOption) => option.id === prev.roomType)
            ? prev
            : { ...prev, roomType: options[0].id })
        }
      } catch (error) {
        console.error('Failed to fetch rooms for booking form:', error)
      }
    })()
    return () => { mounted = false }
  }, [])

  // refetch available rooms when dates or guests change
  useEffect(() => {
    if (!formData.checkIn || !formData.checkOut) return
    let mounted = true
    ;(async () => {
      try {
        const params = new URLSearchParams({ 
          checkIn: formData.checkIn, 
          checkOut: formData.checkOut,
          guests: String(formData.guestsCount)
        })
        const res = await fetch(`/api/rooms/available?${params.toString()}`)
        if (!res.ok) return
        const data = await res.json()
        
        if (data.available && Array.isArray(data.rooms)) {
          const availableRooms = data.rooms.map((r: any) => ({
            id: String(r.id),
            roomId: Number(r.id),
            type: r.type,
            name: r.name,
            price: r.pricePerNight,
            available: true,
            maxGuests: r.maxGuests
          }))
          
          if (mounted && availableRooms.length) {
            setRoomOptions(availableRooms)
            // Select first available room
            setFormData(prev => ({ ...prev, roomType: availableRooms[0].id }))
          } else if (mounted) {
            // No rooms available
            setRoomOptions([])
          }
        } else {
          // No rooms available for these dates
          if (mounted) {
            setRoomOptions([])
          }
        }
      } catch (error) {
        console.error('Failed to fetch availability:', error)
      }
    })()
    return () => { mounted = false }
  }, [formData.checkIn, formData.checkOut, formData.guestsCount])

  const selectedRoom = roomOptions.find(room => room.id === formData.roomType) as RoomOption | undefined
  const nights = formData.checkIn && formData.checkOut ? calculateNights(formData.checkIn, formData.checkOut) : 0
  const subtotal = selectedRoom ? selectedRoom.price * nights : 0
  const taxes = subtotal * 0.1 // 10% tax
  const total = subtotal + taxes

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!stripe || !elements) return

    // Validate terms acceptance
    if (!acceptedTerms) {
      alert('Please accept the Terms of Service and Privacy Policy to continue.')
      return
    }
    if (!selectedRoom) {
      alert('Please select an available room to continue.')
      return
    }

    setLoading(true)

    try {
      // Get the selected room to extract the type and id
      const selectedRoomForBooking = roomOptions.find(room => room.id === formData.roomType)
      
      // Create booking data with room type and room id
      const bookingData = {
        ...formData,
        roomType: selectedRoomForBooking?.type || formData.roomType,  // Use type for booking
        roomId: selectedRoomForBooking?.roomId  // Add room ID for specific room tracking
      }
      
      // Create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(total * 100), // Convert to cents
          booking: bookingData,
        }),
      })

      const paymentData = await response.json()
      if (!response.ok) {
        alert(paymentData.error || 'Unable to create payment. Please try again.')
        return
      }
      const { clientSecret } = paymentData

      // Confirm payment
      const cardElement = elements.getElement(CardElement)!
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: formData.guestName,
            email: formData.guestEmail,
            phone: formData.guestPhone,
          },
        },
      })

      if (error) {
        console.error('Payment failed:', error)
      } else if (paymentIntent?.status === 'succeeded') {
        setSuccess(true)
      }
    } catch (error) {
      console.error('Booking error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Booking Confirmed!</h3>
          <p className="text-gray-600">
            Thank you for choosing AuRooms. You&apos;ll receive a confirmation email shortly.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Booking Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-serif">Book Your Stay</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Guest Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Guest Information</h4>
              <div>
                <label htmlFor="guestName" className="sr-only">Full Name</label>
                <Input
                  id="guestName"
                  placeholder="Full Name"
                  value={formData.guestName}
                  onChange={(e) => setFormData({...formData, guestName: e.target.value})}
                  required
                  aria-label="Full Name"
                />
              </div>
              <div>
                <label htmlFor="guestEmail" className="sr-only">Email Address</label>
                <Input
                  id="guestEmail"
                  type="email"
                  placeholder="Email Address"
                  value={formData.guestEmail}
                  onChange={(e) => setFormData({...formData, guestEmail: e.target.value})}
                  required
                  aria-label="Email Address"
                />
              </div>
              <div>
                <label htmlFor="guestPhone" className="sr-only">Phone Number</label>
                <Input
                  id="guestPhone"
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.guestPhone}
                  onChange={(e) => setFormData({...formData, guestPhone: e.target.value})}
                  required
                  aria-label="Phone Number"
                />
              </div>
            </div>

            {/* Stay Details */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Stay Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label htmlFor="checkInDate" className="sr-only">Check-in Date</label>
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" aria-hidden="true" />
                  <Input
                    id="checkInDate"
                    type="date"
                    value={formData.checkIn}
                    onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
                    className="pl-10"
                    min={new Date().toISOString().split('T')[0]}
                    required
                    aria-label="Check-in Date"
                  />
                </div>
                <div className="relative">
                  <label htmlFor="checkOutDate" className="sr-only">Check-out Date</label>
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" aria-hidden="true" />
                  <Input
                    id="checkOutDate"
                    type="date"
                    value={formData.checkOut}
                    onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
                    className="pl-10"
                    min={formData.checkIn || new Date().toISOString().split('T')[0]}
                    required
                    aria-label="Check-out Date"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label htmlFor="guestsCount" className="sr-only">Number of Guests</label>
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" aria-hidden="true" />
                  <select
                    id="guestsCount"
                    value={formData.guestsCount}
                    onChange={(e) => setFormData({...formData, guestsCount: parseInt(e.target.value)})}
                    className="w-full h-9 pl-10 pr-3 border border-gray-300 rounded-md bg-white text-sm focus:ring-1 focus:ring-primary-600 focus:border-primary-600"
                    aria-label="Number of Guests"
                  >
                    {Array.from({ length: maxGuests }, (_, index) => index + 1).map(num => (
                      <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="roomType" className="sr-only">Room Type</label>
                  <select
                    id="roomType"
                    value={formData.roomType}
                    onChange={(e) => setFormData({...formData, roomType: e.target.value})}
                    className="h-9 px-3 border border-gray-300 rounded-md bg-white text-sm focus:ring-1 focus:ring-primary-600 focus:border-primary-600 w-full"
                    aria-label="Room Type"
                    disabled={roomOptions.length === 0}
                  >
                    {roomOptions.length === 0 ? (
                      <option value="">No rooms available</option>
                    ) : (
                      roomOptions.map((room: {id: string, name: string, price: number, available?: boolean}) => (
                        <option key={room.id} value={room.id}>
                          {room.name} - {formatCurrency(room.price)}/night
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* No rooms available message */}
              {formData.checkIn && formData.checkOut && roomOptions.length === 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-amber-800 text-sm font-medium">
                    😔 We&apos;re sorry, but no rooms are available for the selected dates and number of guests.
                  </p>
                  <p className="text-amber-700 text-xs mt-1">
                    Please try different dates or contact us for assistance.
                  </p>
                </div>
              )}

              <textarea
                placeholder="Special requests or notes..."
                value={formData.specialRequests}
                onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
                className="w-full h-20 px-3 py-2 border border-gray-300 rounded-md resize-none text-sm focus:ring-1 focus:ring-primary-600 focus:border-primary-600"
              />
            </div>

            {/* Payment */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center">
                <CreditCard className="w-4 h-4 mr-2" />
                Payment Information
              </h4>
              <div className="p-4 border border-gray-300 rounded-md">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#374151',
                        '::placeholder': {
                          color: '#9CA3AF',
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Terms and Privacy Checkbox */}
            <div className="flex items-start space-x-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                required
              />
              <label htmlFor="acceptTerms" className="text-sm text-gray-700 cursor-pointer">
                I accept the{' '}
                <a 
                  href="/terms" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 underline font-medium"
                >
                  Terms of Service
                </a>
                {' '}and{' '}
                <a 
                  href="/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 underline font-medium"
                >
                  Privacy Policy
                </a>
              </label>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={!stripe || loading || !acceptedTerms || !selectedRoom}
            >
              {loading ? 'Processing...' : `Pay ${formatCurrency(total)}`}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Booking Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-serif">Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedRoom && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600">Room Type</span>
                <span className="font-medium">{selectedRoom.name}</span>
              </div>
              {selectedRoom && selectedRoom.available === false && (
                <div className="text-sm text-red-600">Selected room is not available for the chosen dates.</div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Price per night</span>
                <span className="font-medium">{formatCurrency(selectedRoom.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Check-in</span>
                <span className="font-medium">{formData.checkIn || 'Select date'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Check-out</span>
                <span className="font-medium">{formData.checkOut || 'Select date'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Guests</span>
                <span className="font-medium">{formData.guestsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nights</span>
                <span className="font-medium">{nights}</span>
              </div>
              
              <hr />
              
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taxes & Fees</span>
                <span className="font-medium">{formatCurrency(taxes)}</span>
              </div>
              
              <hr />
              
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-primary-600">{formatCurrency(total)}</span>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
                  <strong>Note:</strong> Tourist tax of €1 per person per night to be paid on-site (cash only)
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function BookingForm() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  )
}
