'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { KeyRound, AlertCircle, CheckCircle2, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!token) {
      setError('Token di sicurezza mancante nell\'URL. Richiedi un nuovo link dalla pagina di login.')
      return
    }

    if (newPassword.length < 10) {
      setError('La nuova password deve contenere almeno 10 caratteri.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Le due password non coincidono.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message || 'Password aggiornata con successo!')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => {
          router.push('/admin/login')
        }, 2500)
      } else {
        setError(data.error || 'Impossibile reimpostare la password.')
      }
    } catch {
      setError('Errore di connessione. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
          <KeyRound className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Imposta Nuova Password
        </h1>
        <p className="text-sm text-gray-600">
          Scegli una nuova password segreta per il pannello Admin (minimo 10 caratteri).
        </p>
      </div>

      {!token ? (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">
              Link non valido o incompleto. Torna alla pagina di login e clicca su &ldquo;Password dimenticata&rdquo; per ricevere un nuovo link via email.
            </p>
          </div>
          <Link
            href="/admin/login"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Torna al Login</span>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Nuova Password
            </label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimo 10 caratteri"
                required
                minLength={10}
                disabled={loading || Boolean(success)}
                className="w-full pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Conferma Nuova Password
            </label>
            <Input
              id="confirm-password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ripeti la nuova password"
              required
              minLength={10}
              disabled={loading || Boolean(success)}
              className="w-full"
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-800">
                {success} Reindirizzamento al login...
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || Boolean(success) || !newPassword || !confirmPassword}
            className="w-full bg-primary-600 hover:bg-primary-700"
          >
            {loading ? 'Salvataggio in corso...' : 'Salva Nuova Password'}
          </Button>

          <div className="pt-3 text-center">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Torna al Login</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}

export default function AdminResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8 text-center text-gray-600">
            Caricamento...
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}

