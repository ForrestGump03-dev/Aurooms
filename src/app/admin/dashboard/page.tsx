'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Calendar, 
  Users, 
  DollarSign, 
  LogOut, 
  Search,
  Filter,
  Download,
  RefreshCw,
  Trash2,
  Edit,
  Eye,
  BellRing
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Booking {
  id: number
  booking_number: string
  guest_name: string
  guest_email: string
  guest_phone: string
  room_type: string
  check_in: string
  check_out: string
  guests_count: number
  total_amount: number
  payment_status: string
  special_requests: string | null
  created_at: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRoom, setFilterRoom] = useState('all')
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    upcomingCheckIns: 0,
  })

  // Carica prenotazioni
  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/bookings')
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings)
        setFilteredBookings(data.bookings)
        calculateStats(data.bookings)
      } else if (response.status === 401) {
        router.push('/admin/login')
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  // Calcola statistiche
  const calculateStats = (bookings: Booking[]) => {
    const total = bookings.length
    const revenue = bookings.reduce((sum, b) => sum + Number(b.total_amount), 0)
    const upcoming = bookings.filter(b => {
      const checkIn = new Date(b.check_in)
      const today = new Date()
      return checkIn >= today
    }).length

    setStats({
      totalBookings: total,
      totalRevenue: revenue,
      upcomingCheckIns: upcoming,
    })
  }

  // Filtra prenotazioni
  useEffect(() => {
    let filtered = bookings

    // Ricerca per nome, email, booking number
    if (searchTerm) {
      filtered = filtered.filter(b =>
        b.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.guest_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.booking_number.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtra per camera
    if (filterRoom !== 'all') {
      filtered = filtered.filter(b => b.room_type === filterRoom)
    }

    setFilteredBookings(filtered)
  }, [searchTerm, filterRoom, bookings])

  // Logout
  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  // Formatta data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  // Formatta valuta
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  // Elimina prenotazione
  const handleDelete = async (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare questa prenotazione?')) return

    try {
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchBookings() // Ricarica lista
        alert('Prenotazione eliminata con successo')
      } else {
        alert('Errore nell\'eliminazione')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Errore nell\'eliminazione')
    }
  }

  // Abilita notifiche push
  const enableNotifications = async () => {
    try {
      setNotificationsLoading(true)

      // Verifica supporto browser
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        alert('Il tuo browser non supporta le notifiche push')
        return
      }

      // Richiedi permesso
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        alert('Permesso notifiche negato. Abilitalo dalle impostazioni del browser.')
        return
      }

      // Registra Service Worker
      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      // Sottoscrivi alle notifiche push
      // NOTA: Serve VAPID key dal server (implementazione completa richiede web-push library)
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        )
      })

      // Salva subscription sul server
      const response = await fetch('/api/admin/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      })

      if (response.ok) {
        setNotificationsEnabled(true)
        localStorage.setItem('notifications-enabled', 'true')
        alert('✅ Notifiche abilitate! Riceverai avvisi per le nuove prenotazioni.')
      } else {
        alert('Errore nel salvare la subscription')
      }
    } catch (error) {
      console.error('Notification error:', error)
      alert('Errore nell\'abilitazione notifiche: ' + (error as Error).message)
    } finally {
      setNotificationsLoading(false)
    }
  }

  // Utility per convertire VAPID key
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // Verifica stato notifiche al caricamento
  useEffect(() => {
    const enabled = localStorage.getItem('notifications-enabled') === 'true'
    const hasPermission = 'Notification' in window && Notification.permission === 'granted'
    setNotificationsEnabled(enabled && hasPermission)
  }, [])

  // Export CSV
  const exportToCSV = () => {
    const headers = ['Booking Number', 'Nome', 'Email', 'Telefono', 'Camera', 'Check-in', 'Check-out', 'Ospiti', 'Totale']
    const rows = filteredBookings.map(b => [
      b.booking_number,
      b.guest_name,
      b.guest_email,
      b.guest_phone,
      b.room_type,
      formatDate(b.check_in),
      formatDate(b.check_out),
      b.guests_count,
      b.total_amount,
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `prenotazioni-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AuRooms Admin</h1>
            <p className="text-sm text-gray-600">Pannello di Amministrazione</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Esci
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Prenotazioni Totali
              </CardTitle>
              <Calendar className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Fatturato Totale
              </CardTitle>
              <DollarSign className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Check-in Prossimi
              </CardTitle>
              <Users className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingCheckIns}</div>
            </CardContent>
          </Card>
        </div>

        {/* Notification Section */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <BellRing className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Notifiche Push
                  </h3>
                  <p className="text-sm text-gray-600">
                    {notificationsEnabled 
                      ? '✅ Ricevi notifiche istantanee per le nuove prenotazioni' 
                      : 'Abilita per ricevere notifiche istantanee quando arriva una prenotazione'}
                  </p>
                </div>
              </div>
              
              <div>
                {!notificationsEnabled ? (
                  <Button
                    onClick={enableNotifications}
                    disabled={notificationsLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-base"
                  >
                    <BellRing className="w-5 h-5 mr-2" />
                    {notificationsLoading ? 'Attivazione...' : 'Abilita Notifiche'}
                  </Button>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-green-100 border-2 border-green-300 rounded-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-800 font-semibold">Notifiche Attive</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-1 gap-4 w-full sm:w-auto">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Cerca per nome, email o numero prenotazione..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <select
                  value={filterRoom}
                  onChange={(e) => setFilterRoom(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">Tutte le camere</option>
                  <option value="Blue Room">Blue Room</option>
                  <option value="Yellow Room">Yellow Room</option>
                  <option value="Glicine Room">Glicine Room</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchBookings}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Aggiorna
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToCSV}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Esporta CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Prenotazioni ({filteredBookings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Caricamento prenotazioni...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">Nessuna prenotazione trovata</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Booking #</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Cliente</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Camera</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Check-in</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Check-out</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Ospiti</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Totale</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium text-primary-600">
                          {booking.booking_number}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm font-medium text-gray-900">{booking.guest_name}</div>
                          <div className="text-xs text-gray-500">{booking.guest_email}</div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">{booking.room_type}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{formatDate(booking.check_in)}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{formatDate(booking.check_out)}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{booking.guests_count}</td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">
                          {formatCurrency(booking.total_amount)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => alert(`Dettagli prenotazione:\n\n${JSON.stringify(booking, null, 2)}`)}
                              title="Visualizza dettagli"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(booking.id)}
                              title="Elimina prenotazione"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
