'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function AdminRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      try {
        // Verifica se il token JWT è valido
        const response = await fetch('/api/admin/verify', {
          method: 'GET',
          credentials: 'include',
        })

        if (response.ok) {
          // Token valido → vai alla dashboard
          router.push('/admin/dashboard')
        } else {
          // Token non valido o scaduto → vai al login
          router.push('/admin/login')
        }
      } catch (error) {
        // Errore di rete → vai al login per sicurezza
        router.push('/admin/login')
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
        <p className="text-white text-lg font-medium">
          Verifica in corso...
        </p>
      </div>
    </div>
  )
}
