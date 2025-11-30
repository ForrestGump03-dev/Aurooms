import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | AuRooms',
  description: 'Privacy Policy and data protection information for AuRooms Guest House',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-8">
            <strong>Last updated:</strong> October 10, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              AuRooms Guest House (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy and personal data. 
              This Privacy Policy explains how we collect, use, store, and protect your personal information in accordance 
              with the General Data Protection Regulation (GDPR) and applicable Italian data protection laws.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
              <p className="text-sm text-gray-700">
                <strong>Data Controller:</strong><br />
                AuRooms Guest House<br />
                Piazza Pietro Venuti, 12<br />
                90045 Cinisi PA, Italy<br />
                Email: info@aurooms.it<br />
                Phone: +39 375 884 3175
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            <p className="text-gray-700 mb-4">
              We collect the following personal information when you make a booking through our website:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Personal Identification:</strong> Full name</li>
              <li><strong>Contact Information:</strong> Email address and phone number</li>
              <li><strong>Booking Details:</strong> Check-in and check-out dates, number of guests, room type selection</li>
              <li><strong>Payment Information:</strong> Payment details processed securely through Stripe (we do not store credit card information)</li>
              <li><strong>Special Requests:</strong> Any additional information you provide (dietary requirements, accessibility needs, etc.)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">
              We use your personal data for the following purposes:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Booking Management:</strong> To process and confirm your reservation</li>
              <li><strong>Communication:</strong> To send booking confirmations, updates, and respond to your inquiries</li>
              <li><strong>Service Delivery:</strong> To prepare for your arrival and accommodate special requests</li>
              <li><strong>Payment Processing:</strong> To securely process payments through our payment provider, Stripe</li>
              <li><strong>Legal Compliance:</strong> To comply with Italian hospitality regulations and tax requirements</li>
              <li><strong>Service Improvement:</strong> To analyze and improve our services (anonymized data only)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Legal Basis for Processing</h2>
            <p className="text-gray-700 mb-4">
              Under GDPR, we process your personal data based on the following legal grounds:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Contract Performance:</strong> Processing is necessary to fulfill our booking contract with you</li>
              <li><strong>Legal Obligation:</strong> We are required to maintain guest records for Italian tax and hospitality regulations</li>
              <li><strong>Legitimate Interest:</strong> To improve our services and prevent fraud</li>
              <li><strong>Consent:</strong> For marketing communications (where applicable and with your explicit consent)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Sharing and Third Parties</h2>
            <p className="text-gray-700 mb-4">
              We do not sell or rent your personal information. We share your data only with:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Payment Processor:</strong> Stripe Inc. for secure payment processing (GDPR compliant)</li>
              <li><strong>Email Service:</strong> Resend for sending booking confirmations (GDPR compliant)</li>
              <li><strong>Database Provider:</strong> Neon Database for secure data storage (GDPR compliant, EU servers)</li>
              <li><strong>Legal Authorities:</strong> When required by Italian law or legal process</li>
            </ul>
            <p className="text-gray-700 mt-4">
              All third-party service providers are contractually bound to protect your data and use it only for the specified purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Storage and Security</h2>
            <p className="text-gray-700 mb-4">
              <strong>Storage Location:</strong> Your data is stored on secure servers within the European Union (EU).
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Retention Period:</strong> We retain your personal data for:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Active bookings: Until completion of your stay plus 30 days</li>
              <li>Historical bookings: Up to 10 years for tax and legal compliance as required by Italian law</li>
              <li>Marketing data: Until you withdraw consent or request deletion</li>
            </ul>
            <p className="text-gray-700 mt-4">
              <strong>Security Measures:</strong> We implement industry-standard security measures including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>SSL/TLS encryption for data transmission</li>
              <li>Encrypted database storage</li>
              <li>Secure payment processing (PCI DSS compliant via Stripe)</li>
              <li>Access controls and authentication</li>
              <li>Regular security updates and monitoring</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights Under GDPR</h2>
            <p className="text-gray-700 mb-4">
              You have the following rights regarding your personal data:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Right to Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete data</li>
              <li><strong>Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> Request deletion of your data (subject to legal retention requirements)</li>
              <li><strong>Right to Restriction:</strong> Request limitation of processing in certain circumstances</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a structured, commonly used format</li>
              <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for marketing communications at any time</li>
              <li><strong>Right to Lodge a Complaint:</strong> File a complaint with the Italian Data Protection Authority (Garante per la protezione dei dati personali)</li>
            </ul>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
              <p className="text-sm text-gray-700">
                <strong>To exercise your rights, contact us at:</strong><br />
                Email: info@aurooms.it<br />
                WhatsApp: +39 375 884 3175<br />
                Mail: Piazza Pietro Venuti, 12, 90045 Cinisi PA, Italy
              </p>
              <p className="text-sm text-gray-700 mt-2">
                We will respond to your request within 30 days as required by GDPR.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies and Tracking</h2>
            <p className="text-gray-700 mb-4">
              Our website uses cookies to provide essential functionality and improve your experience. 
              When you first visit our site, you can choose which cookies to accept through our cookie banner.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Types of Cookies We Use:</h3>
            
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">🔒 Essential Cookies (Always Active)</h4>
              <p className="text-sm text-gray-700">
                These cookies are strictly necessary for the website to function and cannot be disabled:
              </p>
              <ul className="list-disc pl-6 text-sm text-gray-700 mt-2 space-y-1">
                <li><strong>Session Management:</strong> Keep you logged into the booking system</li>
                <li><strong>Payment Security:</strong> Stripe cookies for secure payment processing (PCI DSS compliant)</li>
                <li><strong>Cookie Preferences:</strong> Remember your cookie choices</li>
                <li><strong>Security:</strong> Prevent fraud and ensure site security</li>
              </ul>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">📊 Analytics Cookies (Optional)</h4>
              <p className="text-sm text-gray-700">
                Help us understand how visitors use our site to improve user experience:
              </p>
              <ul className="list-disc pl-6 text-sm text-gray-700 mt-2 space-y-1">
                <li><strong>Vercel Analytics:</strong> Anonymized traffic and performance data</li>
                <li><strong>Vercel Speed Insights:</strong> Page load times and performance metrics</li>
                <li><strong>Google Search Console:</strong> Search performance and indexing data</li>
                <li><strong>Bing Webmaster Tools:</strong> Search visibility and site health monitoring</li>
              </ul>
              <p className="text-xs text-gray-600 mt-2">
                These tools do not identify you personally and use anonymized data. You can opt-out at any time.
              </p>
            </div>

            <div className="bg-gray-100 border-l-4 border-gray-400 p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">🎯 Marketing Cookies (Currently Not Used)</h4>
              <p className="text-sm text-gray-700">
                We currently do not use any advertising or marketing cookies. If this changes in the future, 
                we will ask for your explicit consent.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Managing Your Cookie Preferences:</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Cookie Banner:</strong> You can change your preferences anytime by clicking the cookie icon in the footer</li>
              <li><strong>Browser Settings:</strong> You can block or delete cookies through your browser settings, but this may affect site functionality</li>
              <li><strong>Do Not Track:</strong> We respect browser Do Not Track signals for analytics cookies</li>
            </ul>

            <p className="text-gray-700 mt-4">
              <strong>Third-Party Cookies:</strong> Our payment processor Stripe may set cookies necessary for secure 
              transactions. These are essential for payment processing and fraud prevention.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. No User Accounts or Authentication</h2>
            <p className="text-gray-700">
              Our website does not require user registration or login. We do not create user accounts or store passwords. 
              Each booking is processed independently, and your data is collected only at the time of reservation.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Children&apos;s Privacy</h2>
            <p className="text-gray-700">
              Our services are not directed to individuals under the age of 18. We do not knowingly collect personal 
              information from children. If you are a parent or guardian and believe we have collected data about a child, 
              please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. International Data Transfers</h2>
            <p className="text-gray-700">
              Your data is primarily stored and processed within the European Union. In cases where data is transferred 
              to third-party services outside the EU (such as Stripe&apos;s US operations), appropriate safeguards are in place 
              including Standard Contractual Clauses (SCCs) approved by the European Commission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to This Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. 
              The &quot;Last updated&quot; date at the top of this page indicates when the policy was last revised. We encourage you 
              to review this policy periodically.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have questions about this Privacy Policy or how we handle your personal data, please contact us:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700">
                <strong>AuRooms Guest House</strong><br />
                Piazza Pietro Venuti, 12<br />
                90045 Cinisi PA, Italy<br /><br />
                Email: <a href="mailto:info@aurooms.it" className="text-blue-600 hover:underline">info@aurooms.it</a><br />
                WhatsApp: <a href="https://wa.me/393758843175" className="text-blue-600 hover:underline">+39 375 884 3175</a><br />
                Phone: +39 375 884 3175
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Data Protection Authority</h2>
            <p className="text-gray-700">
              If you have concerns about our data processing practices and are not satisfied with our response, 
              you have the right to lodge a complaint with the Italian Data Protection Authority:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg mt-4">
              <p className="text-gray-700">
                <strong>Garante per la protezione dei dati personali</strong><br />
                Piazza Venezia, 11<br />
                00187 Roma, Italy<br />
                Website: <a href="https://www.garanteprivacy.it" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">www.garanteprivacy.it</a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
