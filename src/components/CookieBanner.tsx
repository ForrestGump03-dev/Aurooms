'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Cookie } from 'lucide-react'
import { Button } from './ui/button'

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
  })

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      const timer = setTimeout(() => setShowBanner(true), 1000)
      return () => clearTimeout(timer)
    } else {
      const saved = JSON.parse(consent)
      setPreferences(saved)
      if (saved.analytics) {
        enableAnalytics()
      }
    }
  }, [])

  const enableAnalytics = () => {
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('event', 'consent_granted')
    }
  }

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
    }
    setPreferences(allAccepted)
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted))
    enableAnalytics()
    setShowBanner(false)
  }

  const acceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
    }
    setPreferences(necessaryOnly)
    localStorage.setItem('cookie-consent', JSON.stringify(necessaryOnly))
    setShowBanner(false)
  }

  const savePreferences = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences))
    if (preferences.analytics) {
      enableAnalytics()
    }
    setShowBanner(false)
    setShowSettings(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-2xl bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
        {!showSettings ? (
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Cookie className="w-8 h-8 text-gold-500 flex-shrink-0" />
                <h3 className="text-xl font-bold text-gray-900">
                  We Respect Your Privacy
                </h3>
              </div>
              <button
                onClick={acceptNecessary}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 mb-4 leading-relaxed">
              We use essential cookies to ensure the website functions properly and analytics cookies to improve your experience. 
              <strong> If you decline analytics, no data will be collected.</strong>
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm text-gray-700">
              <p className="mb-2">
                 <strong>Essential Cookies (Always Active):</strong> Booking management and secure Stripe payments
              </p>
              <p>
                 <strong>Analytics Cookies (Optional):</strong> Vercel Analytics, Google/Bing Webmaster - 
                <span className="text-primary-600"> only activated with your consent</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={acceptAll}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
              >
                Accept All
              </Button>
              <Button
                onClick={() => setShowSettings(true)}
                variant="outline"
                className="flex-1"
              >
                Customize
              </Button>
              <Button
                onClick={acceptNecessary}
                variant="ghost"
                className="flex-1 text-gray-600 hover:text-gray-900"
              >
                Essential Only
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              Read our{' '}
              <Link href="/privacy" className="text-primary-600 hover:underline">
                Privacy Policy
              </Link>{' '}
              for more information.
            </p>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Manage Cookie Preferences
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-gray-900">Essential Cookies</h4>
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                      Always Active
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Required for the website to function: session management, bookings, Stripe payments, security.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="mt-1 w-5 h-5 text-primary-600 rounded"
                />
              </div>

              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 mr-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Analytics Cookies</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Help us understand how visitors interact with the site to improve user experience.
                  </p>
                  <p className="text-xs text-gray-500">
                    Includes: Vercel Analytics, Google Search Console, Bing Webmaster Tools
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={savePreferences}
                className="flex-1 bg-primary-600 hover:bg-primary-700"
              >
                Save Preferences
              </Button>
              <Button
                onClick={() => setShowSettings(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
