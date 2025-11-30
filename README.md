# AuRooms - Luxury Guest House Booking System

A modern, full-stack booking platform built for AuRooms Guest House in Cinisi, Sicily. This project features a seamless booking experience for guests and a powerful administration dashboard for management, complete with real-time push notifications.

![AuRooms Preview](https://placehold.co/1200x600/png?text=AuRooms+Preview)

## ✨ Features

### 🏨 Guest Experience
- **Real-time Availability**: Instant checks for room availability.
- **Secure Payments**: Integrated Stripe checkout for safe transactions.
- **Automated Emails**: Instant booking confirmations via Resend.
- **Responsive Design**: Optimized for mobile, tablet, and desktop.
- **Multi-language Support**: Built with internationalization in mind.
- **GDPR Compliance**: Granular cookie consent management.

### 🔐 Admin Dashboard
- **Secure Authentication**: JWT-based login with rate limiting and brute-force protection.
- **Booking Management**: View, filter, and delete bookings.
- **Real-time Analytics**: Dashboard for revenue, occupancy, and upcoming check-ins.
- **Push Notifications**: Web Push API integration for instant alerts on new bookings (Desktop & Mobile).
- **Data Export**: CSV export functionality for accounting.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (via [Neon](https://neon.tech/))
- **ORM**: Raw SQL / Custom Helpers
- **Payments**: Stripe
- **Email**: Resend
- **Notifications**: Web Push API
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL Database
- Stripe Account
- Resend Account
- Vercel Account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ForrestGump03-dev/Aurooms_Claude.git
   cd aurooms
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Copy `.env.example` to `.env.development` and configure your keys:
   ```bash
   cp .env.example .env.development
   ```

   **Required Variables:**
   ```env
   # Database
   DATABASE_URL="postgresql://..."

   # Stripe
   STRIPE_SECRET_KEY="sk_test_..."
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

   # Resend
   RESEND_API_KEY="re_..."

   # Admin Auth
   ADMIN_PASSWORD="YourSecurePassword"
   JWT_SECRET="your-secret-key"

   # Push Notifications
   NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-public-key"
   VAPID_PRIVATE_KEY="your-private-key"
   VAPID_SUBJECT="mailto:admin@example.com"
   ```

4. **Database Setup**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

## 📚 Documentation

Detailed guides for deployment and management can be found in the `docs/` directory:

- [📖 Deployment Guide](docs/DEPLOYMENT.md) - Production setup instructions.
- [🔐 Admin Guide](docs/ADMIN_GUIDE.md) - How to use the dashboard.
- [🍪 Cookie Consent](docs/COOKIE_CONSENT.md) - Technical details on GDPR compliance.
- [🎨 Favicon Guide](docs/FAVICON.md) - Branding customization.

## 📄 License

This project is licensed under the MIT License.
