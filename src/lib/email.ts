import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not defined');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBookingConfirmation(booking: any) {
  try {
    // Formatta le date senza timestamp (solo gg/mm/aaaa)
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('it-IT', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    };

    const checkInDate = formatDate(booking.checkIn);
    const checkOutDate = formatDate(booking.checkOut);

    // Usa sempre info@aurooms.it (dominio verificato su Resend)
    const { data, error } = await resend.emails.send({
      from: 'AuRooms <info@aurooms.it>',
      to: [booking.guestEmail],
      subject: `Booking Confirmation - ${booking.bookingNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">AuRooms</h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0;">Luxury Guest House - Cinisi, Sicily</p>
          </div>
          
          <div style="padding: 30px; background: #ffffff;">
            <h2 style="color: #1d4ed8; margin: 0 0 20px 0;">Booking Confirmed!</h2>
            
            <p>Dear ${booking.guestName},</p>
            <p>Thank you for choosing AuRooms! Your booking has been confirmed.</p>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #1d4ed8;">Booking Details</h3>
              <p><strong>Booking Number:</strong> ${booking.bookingNumber}</p>
              <p><strong>Guest Name:</strong> ${booking.guestName}</p>
              <p><strong>Check-in:</strong> ${checkInDate}</p>
              <p><strong>Check-out:</strong> ${checkOutDate}</p>
              <p><strong>Room Type:</strong> ${booking.roomType}</p>
              <p><strong>Guests:</strong> ${booking.guestsCount}</p>
              <p><strong>Total Amount:</strong> €${booking.totalAmount}</p>
              <p style="color: #d97706; font-size: 14px; margin-top: 10px;">
                ℹ️ <strong>Tourist Tax:</strong> €1 per person per night to be paid on-site (cash only)
              </p>
              ${booking.specialRequests ? `<p><strong>Special Requests:</strong> ${booking.specialRequests}</p>` : ''}
            </div>
            
            <div style="background: #fef7ed; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #d97706;">⏰ Check-in & Check-out Instructions</h3>
              <p style="margin: 10px 0;"><strong>Check-in:</strong> Available from <strong>3:00 PM</strong></p>
              <p style="margin: 10px 0;"><strong>Check-out:</strong> By <strong>11:00 AM</strong></p>
              <p style="margin: 15px 0 10px 0; padding: 15px; background: #fff; border-radius: 6px; color: #92400e;">
                ⚠️ <strong>Important:</strong> Please respect these times. If you need to arrive outside check-in hours or require a late check-out, please contact us in advance via <a href="https://wa.me/393758843175" style="color: #d97706;">WhatsApp</a> or <a href="mailto:info@aurooms.it" style="color: #d97706;">email</a>
              </p>
            </div>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #0369a1;">📍 Property Information</h3>
              <p><strong>Address:</strong> Piazza Pietro Venuti, 12, 90045 Cinisi PA</p>
              <p><strong>Airport Distance:</strong> Just 3km from Palermo Airport (10 min drive)</p>
              <p><strong>WhatsApp:</strong> <a href="https://wa.me/393758843175" style="color: #0369a1;">+39 375 884 3175</a></p>
              <p><strong>Email:</strong> <a href="mailto:info@aurooms.it" style="color: #0369a1;">info@aurooms.it</a></p>
            </div>
            
            <p style="margin-top: 30px;">We look forward to welcoming you to Sicily!</p>
            <p style="color: #6b7280; font-size: 14px;">If you have any questions, please don't hesitate to contact us.</p>
            
            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 5px 0;">AuRooms Guest House</p>
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">Cinisi, Sicily - www.aurooms.it</p>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Email sending error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error };
  }
}