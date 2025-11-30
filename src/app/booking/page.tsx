import { Metadata } from 'next'
import BookingForm from '@/components/BookingForm'

export const metadata: Metadata = {
  title: 'Book Your Stay - Reserve Your Room at AuRooms Guest House',
  description: 'Book your luxury accommodation at AuRooms Guest House in Cinisi, Sicily. Easy online booking, secure payment, instant confirmation. Family and couple rooms available near Palermo Airport.',
  openGraph: {
    title: 'Book Your Stay | AuRooms Guest House Sicily',
    description: 'Reserve your luxury room online. Instant confirmation, secure payment, best rates guaranteed.',
    url: 'https://aurooms.it/booking',
  },
}

export default function BookingPage() {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative h-64 bg-gradient-to-r from-primary-600 to-primary-700 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-3xl px-4">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-4">
              Book Your Stay
            </h1>
            <p className="text-xl text-primary-100">
              Reserve your luxury room at AuRooms and experience authentic Sicilian hospitality
            </p>
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tourist Tax Notice */}
          <div className="mb-8 bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-800">
                  <strong>Tourist Tax Notice:</strong> A tourist tax of €1 per person per night will apply and must be paid on-site in cash upon arrival.
                </p>
              </div>
            </div>
          </div>
          
          <BookingForm />
        </div>
      </section>
    </div>
  )
}