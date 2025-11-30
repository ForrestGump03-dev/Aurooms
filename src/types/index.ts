export interface Room {
  id: string;
  name: string;
  type: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  size?: string;
  bedType?: string;
  amenities: string[];
  imageUrls: string[];
  available: boolean;
}

export interface Booking {
  id?: string;
  bookingNumber?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  roomType: string;
  totalAmount: number;
  specialRequests?: string;
  stripePaymentIntentId?: string;
  paymentStatus: 'pending' | 'confirmed' | 'failed';
  bookingStatus: 'confirmed' | 'cancelled';
}

export interface Guest {
  name: string;
  email: string;
  phone: string;
}