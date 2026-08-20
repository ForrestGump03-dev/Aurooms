import Image from 'next/image'
import Link from 'next/link'
import { Phone, MessageCircle, Mail, MapPin, Sparkles, Lock } from 'lucide-react'
import type { SiteSettings } from '@/lib/site-settings'

interface MaintenanceViewProps {
  settings: SiteSettings
}

export default function MaintenanceView({ settings }: MaintenanceViewProps) {
  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 text-white flex flex-col justify-between relative overflow-hidden font-sans selection:bg-gold-500 selection:text-white">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[900px] h-[400px] bg-gold-600/10 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gold-500/5 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-1/3 -right-32 w-80 h-80 bg-primary-600/5 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Top Header / Brand */}
      <header className="w-full max-w-6xl mx-auto px-6 pt-8 sm:pt-10 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-gold-500 to-gold-300 p-0.5 shadow-lg shadow-gold-500/20">
            <div className="w-full h-full bg-stone-950 rounded-[10px] flex items-center justify-center p-1.5 overflow-hidden">
              <Image
                src="/logo_aurooms.png"
                alt={settings.businessName || 'AuRooms'}
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div>
            <span className="font-serif font-bold text-xl sm:text-2xl tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-gold-200 via-gold-400 to-gold-100">
              {settings.shortName || 'AuRooms'}
            </span>
            <div className="flex items-center text-xs text-stone-400 font-light">
              <MapPin className="w-3 h-3 mr-1 text-gold-400" aria-hidden="true" />
              <span>{settings.city || 'Cinisi'}, {settings.country || 'Sicily'}</span>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-stone-800/60 border border-stone-700/50 backdrop-blur-md text-xs text-stone-300">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>System Upgrade in Progress</span>
        </div>
      </header>

      {/* Main Content Box */}
      <main className="w-full max-w-3xl mx-auto px-6 py-12 sm:py-16 text-center z-10 flex flex-col items-center">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs sm:text-sm font-medium mb-8 backdrop-blur-sm shadow-inner">
          <Sparkles className="w-4 h-4 text-gold-400" />
          <span>Scheduled Maintenance & Enhancement</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
          We are perfecting our digital experience.
        </h1>

        {/* Subtitle / Custom Message */}
        <p className="text-stone-300 text-base sm:text-lg lg:text-xl font-light leading-relaxed max-w-2xl mb-10">
          {settings.maintenanceMessage ? (
            settings.maintenanceMessage
          ) : (
            <>
              Our portal is temporarily offline for scheduled system upgrades and maintenance. 
              We will be back online shortly with an even more refined booking experience.
            </>
          )}
        </p>

        {/* Direct Contacts Card */}
        <div className="w-full bg-stone-900/80 border border-stone-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/60">
          <h2 className="text-xs uppercase tracking-widest text-gold-400 font-semibold mb-4">
            Need Immediate Assistance or Direct Booking?
          </h2>
          <p className="text-stone-400 text-sm mb-6">
            Our guest reception is available to assist you directly:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* WhatsApp */}
            {settings.whatsappUrl && (
              <a
                href={settings.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl bg-emerald-600/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/20 hover:border-emerald-500/50 hover:text-emerald-200 transition-all text-sm font-medium group"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>WhatsApp</span>
              </a>
            )}

            {/* Direct Phone */}
            {settings.phoneHref && (
              <a
                href={`tel:${settings.phoneHref}`}
                className="flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl bg-gold-600/10 border border-gold-500/30 text-gold-300 hover:bg-gold-600/20 hover:border-gold-500/50 hover:text-gold-200 transition-all text-sm font-medium group"
              >
                <Phone className="w-4 h-4 text-gold-400 group-hover:scale-110 transition-transform" />
                <span>{settings.phoneDisplay || 'Call Us'}</span>
              </a>
            )}

            {/* Email */}
            {settings.email && (
              <a
                href={`mailto:${settings.email}`}
                className="flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl bg-stone-800/80 border border-stone-700/60 text-stone-200 hover:bg-stone-800 hover:border-stone-600 transition-all text-sm font-medium group"
              >
                <Mail className="w-4 h-4 text-stone-400 group-hover:scale-110 transition-transform" />
                <span>Email Us</span>
              </a>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-stone-800/80 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-stone-500">
            <span>📍 {settings.addressLine}, {settings.city}</span>
            <span>✈️ {settings.airportDistanceLabel}</span>
          </div>
        </div>
      </main>

      {/* Footer & Discrete Admin Entry Point */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 z-10 border-t border-stone-900/60">
        <p>© {currentYear} {settings.businessName}. All rights reserved.</p>

        <a
          href="/admin/login"
          className="inline-flex items-center gap-1.5 text-stone-500 hover:text-gold-400 transition-colors opacity-75 hover:opacity-100 py-1 px-2 rounded-md hover:bg-stone-900/50 cursor-pointer"
          title="Staff and Admin Portal"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Admin Access</span>
        </a>
      </footer>
    </div>
  )
}
