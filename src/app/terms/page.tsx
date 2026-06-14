import { Metadata } from 'next'
import { getSiteSettings } from '@/lib/site-settings'

export const metadata: Metadata = {
  title: 'Terms of Service | AuRooms',
  description: 'Terms and conditions for booking at AuRooms Guest House',
}

export default async function TermsPage() {
  const settings = await getSiteSettings()
  const websiteLabel = settings.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-8">
            <strong>Last updated:</strong> October 2, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms of Service (&quot;Terms&quot;) govern your booking and stay at AuRooms Guest House (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). 
              By making a reservation through our website, you agree to be bound by these Terms. Please read them carefully 
              before completing your booking.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
              <p className="text-sm text-gray-700">
                <strong>Property Details:</strong><br />
                {settings.businessName}<br />
                {settings.addressLine}<br />
                {settings.postalCode} {settings.city} {settings.province}, {settings.country}<br />
                Email: {settings.email}<br />
                WhatsApp/Phone: {settings.phoneDisplay}
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Booking and Reservations</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Booking Process</h3>
            <p className="text-gray-700 mb-4">
              All bookings must be made through our website at {websiteLabel}. Upon successful payment, you will receive 
              a booking confirmation email containing your booking number and reservation details.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Booking Confirmation</h3>
            <p className="text-gray-700 mb-4">
              Your booking is confirmed only when:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Payment has been successfully processed</li>
              <li>You have received a confirmation email with your booking number</li>
              <li>The selected room is available for your chosen dates</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.3 Minimum Age</h3>
            <p className="text-gray-700">
              Guests must be at least 18 years old to make a booking. The lead guest must present valid identification 
              (passport or ID card) upon check-in.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Payment Terms</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Payment Processing</h3>
            <p className="text-gray-700 mb-4">
              All payments are processed securely through Stripe. We accept major credit and debit cards. 
              Payment must be completed at the time of booking.
            </p>

            <div className="bg-green-50 border-l-4 border-green-500 p-4 my-4">
              <p className="text-sm text-gray-700">
                <strong>✓ Full Payment Required:</strong><br />
                The online payment represents the <strong>total amount</strong> for your entire stay. 
                No additional payment is required at check-in or check-out (except for optional services or damages).
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Currency</h3>
            <p className="text-gray-700 mb-4">
              All prices are quoted in Euros (EUR) and include VAT as required by Italian law.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.3 Price Accuracy</h3>
            <p className="text-gray-700">
              We strive to ensure all prices are accurate. In the event of a pricing error, we will notify you 
              and give you the option to proceed at the correct price or cancel your booking with a full refund.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Cancellation Policy</h2>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
              <p className="text-gray-700">
                <strong>Free Cancellation Period:</strong><br />
                Guests may cancel their reservation <strong>free of charge up to 7 days (168 hours)</strong> before the scheduled check-in date.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Cancellation Fees</h3>
            <p className="text-gray-700 mb-4">
              The following cancellation fees apply based on when you cancel:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-3">
              <li>
                <strong>More than 7 days before check-in:</strong> Full refund, no cancellation fee
              </li>
              <li>
                <strong>Within 7 days of check-in:</strong> Cancellation fee equal to <strong>one night&apos;s accommodation</strong> will be charged. 
                The remaining amount will be refunded.
              </li>
              <li>
                <strong>No-show:</strong> If you do not arrive and have not cancelled your reservation, the <strong>full booking amount</strong> will be forfeited (no refund).
              </li>
            </ul>

            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 my-4">
              <p className="text-sm text-gray-700">
                <strong>Example:</strong> If you booked 3 nights at €65/night (total €195) and cancel 5 days before check-in, 
                you will be charged €65 (one night) and refunded €130 (two nights).
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 How to Cancel</h3>
            <p className="text-gray-700 mb-4">
              To cancel a reservation, please contact us as soon as possible:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Email:</strong> {settings.email}</li>
              <li><strong>WhatsApp:</strong> {settings.phoneDisplay} (fastest response)</li>
              <li><strong>Phone:</strong> {settings.phoneDisplay}</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Please include your booking number and the reason for cancellation. Cancellations must be confirmed in writing (email or WhatsApp message). 
              The cancellation date is determined by when we receive your cancellation request, not when you send it.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.3 Refund Processing</h3>
            <p className="text-gray-700">
              Refunds will be processed within 5-10 business days to the original payment method used for booking. 
              Please note that it may take additional time for your bank or credit card company to process the refund.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.4 Force Majeure</h3>
            <p className="text-gray-700">
              In exceptional cases of force majeure (natural disasters, government-imposed travel restrictions, pandemic lockdowns, etc.), 
              we will work with you to reschedule your stay or provide a full refund on a case-by-case basis, regardless of the standard cancellation policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Check-in and Check-out</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Standard Times</h3>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-gray-700">
                <strong>Check-in:</strong> From 3:00 PM<br />
                <strong>Check-out:</strong> By 11:00 AM
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Early Check-in</h3>
            <p className="text-gray-700 mb-4">
              <strong>Check-in before 3:00 PM is not possible</strong> as rooms require cleaning and preparation after the previous guest&apos;s departure. 
              We appreciate your understanding and ask that you plan your arrival accordingly.
            </p>
            <p className="text-gray-700">
              If you arrive early, you are welcome to store your luggage with us while you explore the area. 
              Cinisi and the nearby beaches are wonderful places to spend a few hours before check-in!
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.3 Late Check-out</h3>
            <p className="text-gray-700 mb-4">
              If you wish to extend your stay beyond the standard 11:00 AM check-out time:
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
              <p className="text-gray-700">
                <strong>Late Check-out Fee:</strong><br />
                A supplement of <strong>€50</strong> applies if you wish to remain in your room for an additional 2-3 hours after 11:00 AM (until approximately 1:00 PM - 2:00 PM).
              </p>
            </div>
            <p className="text-gray-700 mb-4">
              <strong>Important:</strong> Late check-out is subject to availability and must be requested and confirmed at least 24 hours in advance. 
              Please contact us via:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>WhatsApp:</strong> {settings.phoneDisplay} (fastest response)</li>
              <li><strong>Email:</strong> {settings.email}</li>
            </ul>
            <p className="text-gray-700 mt-4">
              If late check-out is not available due to same-day arrivals, complimentary luggage storage will be provided 
              so you can enjoy your final hours in Sicily without worry.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.4 Late Arrival</h3>
            <p className="text-gray-700">
              If you expect to arrive after 10:00 PM, please notify us in advance. We will provide you with 
              self check-in instructions to ensure smooth access to your room.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.5 No-Show</h3>
            <p className="text-gray-700">
              If you fail to arrive on your scheduled check-in date without prior cancellation, your booking 
              will be considered a no-show and the full booking amount will be forfeited (no refund).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Guest Responsibilities</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 Property Care</h3>
            <p className="text-gray-700 mb-4">
              Guests are expected to treat the property and furnishings with care and respect. You are responsible for:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Any damage caused to the room, furniture, or facilities during your stay</li>
              <li>Loss of keys or access cards</li>
              <li>Excessive cleaning required beyond normal housekeeping</li>
              <li>Violations of our non-smoking policy</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Guests will be charged for any damages or excessive cleaning costs. In case of significant damage, 
              we reserve the right to charge the payment method on file for repair or replacement costs.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">6.2 Maximum Occupancy</h3>
            <p className="text-gray-700 mb-4">
              Each room has a maximum guest capacity:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Blue Room (Family):</strong> Maximum 4 guests</li>
              <li><strong>Glicine Room (Couple):</strong> Maximum 2 guests</li>
              <li><strong>Yellow Room (Couple):</strong> Maximum 2 guests</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Exceeding the maximum occupancy is strictly prohibited for safety and insurance reasons.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">6.3 Noise and Disturbances</h3>
            <p className="text-gray-700">
              Guests must respect quiet hours (typically 10:00 PM - 8:00 AM) and avoid disturbing other guests or neighbors. 
              Excessive noise or disruptive behavior may result in immediate termination of your stay without refund.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">6.4 Smoking Policy</h3>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
              <p className="text-gray-700">
                <strong>🚭 Completely Non-Smoking Property</strong><br />
                AuRooms Guest House is a <strong>100% non-smoking property</strong>. Smoking is strictly prohibited in all indoor areas, 
                including guest rooms, bathrooms, hallways, and common spaces.
              </p>
            </div>
            <p className="text-gray-700 mb-4">
              <strong>Violation of Smoking Policy:</strong> Guests who smoke inside the property will be charged a minimum cleaning fee of <strong>€200</strong> 
              to cover deep cleaning, odor removal, and potential damage. This fee will be charged to the payment method on file.
            </p>
            <p className="text-gray-700">
              If you need to smoke, please do so outside the building in designated outdoor areas while being respectful of other guests.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">6.5 Pet Policy</h3>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
              <p className="text-gray-700">
                <strong>🐕 No Pets Allowed</strong><br />
                Unfortunately, we do not accept pets of any kind at AuRooms Guest House. This policy is in place to maintain 
                cleanliness standards and accommodate guests with allergies.
              </p>
            </div>
            <p className="text-gray-700">
              Service animals may be permitted with advance notice and appropriate documentation. Please contact us 
              at {settings.email} or {settings.phoneDisplay} to discuss your specific situation.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Our Rights and Responsibilities</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">7.1 Right to Refuse Service</h3>
            <p className="text-gray-700 mb-4">
              We reserve the right to refuse service or terminate a booking if:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>The guest engages in illegal activities</li>
              <li>The guest causes damage to the property</li>
              <li>The guest violates these Terms of Service</li>
              <li>The guest creates a disturbance for other guests or neighbors</li>
              <li>False information was provided during booking</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">7.2 Property Access</h3>
            <p className="text-gray-700">
              We reserve the right to enter your room for maintenance, safety inspections, or emergency situations 
              with appropriate notice (except in true emergencies).
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">7.3 Modifications to Booking</h3>
            <p className="text-gray-700">
              In rare circumstances, we may need to change your room assignment or modify your booking. 
              If this occurs, we will provide an equivalent or superior accommodation at no additional cost, 
              or offer a full refund if the alternative is not acceptable.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Liability and Insurance</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">8.1 Personal Belongings</h3>
            <p className="text-gray-700">
              We are not responsible for loss, theft, or damage to guests&apos; personal belongings. 
              We recommend securing valuables and obtaining travel insurance.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">8.2 Limitation of Liability</h3>
            <p className="text-gray-700">
              Our liability is limited to the total amount paid for your booking. We are not liable for 
              indirect, consequential, or incidental damages including but not limited to travel expenses, 
              loss of time, or emotional distress.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">8.3 Travel Insurance</h3>
            <p className="text-gray-700">
              We strongly recommend purchasing comprehensive travel insurance to cover cancellations, 
              medical emergencies, and personal belongings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Privacy and Data Protection</h2>
            <p className="text-gray-700">
              Your personal information is processed in accordance with our Privacy Policy and applicable 
              data protection laws (GDPR). Please review our <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a> for 
              detailed information about how we collect, use, and protect your data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Complaints and Disputes</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">10.1 Complaints During Your Stay</h3>
            <p className="text-gray-700 mb-4">
              If you encounter any issues during your stay, please notify us immediately so we can address 
              the problem promptly:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>WhatsApp: {settings.phoneDisplay} (fastest response)</li>
              <li>Email: {settings.email}</li>
              <li>Phone: {settings.phoneDisplay}</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">10.2 Post-Stay Complaints</h3>
            <p className="text-gray-700">
              Complaints after your stay must be submitted in writing within 7 days of check-out. 
              We will investigate and respond within 14 days.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">10.3 Dispute Resolution</h3>
            <p className="text-gray-700">
              We will make every effort to resolve disputes amicably. If a resolution cannot be reached, 
              disputes will be subject to the jurisdiction of Italian courts in Palermo, Sicily.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Governing Law</h2>
            <p className="text-gray-700">
              These Terms of Service are governed by the laws of Italy. Any disputes arising from these Terms 
              or your booking shall be subject to the exclusive jurisdiction of the courts of Palermo, Sicily, Italy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to Terms</h2>
            <p className="text-gray-700">
              We reserve the right to modify these Terms of Service at any time. Changes will be effective 
              immediately upon posting on our website. Your continued use of our services after changes are 
              posted constitutes acceptance of the modified Terms. The booking confirmation you receive will 
              reference the version of Terms in effect at the time of your booking.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Entire Agreement</h2>
            <p className="text-gray-700">
              These Terms of Service, together with our Privacy Policy and your booking confirmation, 
              constitute the entire agreement between you and AuRooms Guest House regarding your reservation and stay.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              If you have questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700">
                <strong>{settings.businessName}</strong><br />
                {settings.addressLine}<br />
                {settings.postalCode} {settings.city} {settings.province}, {settings.country}<br /><br />
                Email: <a href={`mailto:${settings.email}`} className="text-blue-600 hover:underline">{settings.email}</a><br />
                WhatsApp: <a href={settings.whatsappUrl} className="text-blue-600 hover:underline">{settings.phoneDisplay}</a><br />
                Phone: {settings.phoneDisplay}<br />
                Website: <a href={settings.websiteUrl} className="text-blue-600 hover:underline">{websiteLabel}</a>
              </p>
            </div>
          </section>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-8">
            <p className="text-sm text-gray-700">
              <strong>Acknowledgment:</strong><br />
              By completing a booking on our website, you acknowledge that you have read, understood, and agree 
              to be bound by these Terms of Service and our Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
