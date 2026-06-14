'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BedDouble,
  BellRing,
  Calendar,
  DollarSign,
  Download,
  Eye,
  LogOut,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  Trash2,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Room } from '@/types'
import type { SiteSettings } from '@/lib/site-settings'

interface Booking {
  id: number
  booking_number: string
  guest_name: string
  guest_email: string
  guest_phone: string
  room_type: string
  room_id?: number | null
  check_in: string
  check_out: string
  guests_count: number
  total_amount: number
  payment_status: string
  special_requests: string | null
  created_at: string
}

interface AdminStats {
  totalBookings: number
  totalRevenue: number
  upcomingCheckIns: number
}

type AdminTab = 'bookings' | 'rooms' | 'settings'

const emptyRoomForm = {
  name: '',
  type: '',
  description: '',
  pricePerNight: 0,
  maxGuests: 2,
  size: '',
  bedType: '',
  amenitiesText: 'WiFi\nAir Conditioning\nTV',
  imageUrlsText: '',
  available: true,
}

function roomToForm(room: Room) {
  return {
    name: room.name,
    type: room.type,
    description: room.description,
    pricePerNight: room.pricePerNight,
    maxGuests: room.maxGuests,
    size: room.size || '',
    bedType: room.bedType || '',
    amenitiesText: room.amenities.join('\n'),
    imageUrlsText: room.imageUrls.join('\n'),
    available: room.available,
  }
}

function splitLines(value: string) {
  return value
    .split('\n')
    .flatMap(item => item.split(','))
    .map(item => item.trim())
    .filter(Boolean)
}

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<AdminTab>('bookings')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRoom, setFilterRoom] = useState('all')
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null)
  const [roomForm, setRoomForm] = useState(emptyRoomForm)
  const [settingsForm, setSettingsForm] = useState<SiteSettings | null>(null)
  const [stats, setStats] = useState<AdminStats>({
    totalBookings: 0,
    totalRevenue: 0,
    upcomingCheckIns: 0,
  })

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const matchesSearch = !searchTerm ||
        booking.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.guest_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.booking_number.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRoom = filterRoom === 'all' || booking.room_type === filterRoom
      return matchesSearch && matchesRoom
    })
  }, [bookings, filterRoom, searchTerm])

  const roomTypes = useMemo(() => {
    const values = new Set<string>()
    rooms.forEach(room => values.add(room.type))
    bookings.forEach(booking => values.add(booking.room_type))
    return Array.from(values).filter(Boolean).sort()
  }, [bookings, rooms])

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true)
      const [bookingsResponse, roomsResponse, settingsResponse, statsResponse] = await Promise.all([
        fetch('/api/admin/bookings'),
        fetch('/api/admin/rooms'),
        fetch('/api/admin/settings'),
        fetch('/api/admin/stats'),
      ])

      if ([bookingsResponse, roomsResponse, settingsResponse, statsResponse].some(response => response.status === 401)) {
        router.push('/admin/login')
        return
      }

      if (bookingsResponse.ok) {
        const data = await bookingsResponse.json()
        setBookings(data.bookings || [])
      }

      if (roomsResponse.ok) {
        const data = await roomsResponse.json()
        setRooms(data.rooms || [])
      }

      if (settingsResponse.ok) {
        const data = await settingsResponse.json()
        setSettingsForm(data.settings)
      }

      if (statsResponse.ok) {
        const data = await statsResponse.json()
        setStats(data.stats || {
          totalBookings: 0,
          totalRevenue: 0,
          upcomingCheckIns: 0,
        })
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchAdminData()
  }, [fetchAdminData])

  useEffect(() => {
    const enabled = localStorage.getItem('notifications-enabled') === 'true'
    const hasPermission = 'Notification' in window && Notification.permission === 'granted'
    setNotificationsEnabled(enabled && hasPermission)
  }, [])

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const formatCurrency = (amount: number) => new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)

  const handleDeleteBooking = async (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare questa prenotazione?')) return

    const response = await fetch(`/api/admin/bookings/${id}`, { method: 'DELETE' })
    if (response.ok) {
      await fetchAdminData()
      alert('Prenotazione eliminata con successo')
    } else {
      alert('Errore nell eliminazione')
    }
  }

  const enableNotifications = async () => {
    try {
      setNotificationsLoading(true)

      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        alert('Il tuo browser non supporta le notifiche push')
        return
      }

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidPublicKey) {
        alert('Chiave pubblica VAPID mancante. Controlla NEXT_PUBLIC_VAPID_PUBLIC_KEY.')
        return
      }

      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        alert('Permesso notifiche negato. Abilitalo dalle impostazioni del browser.')
        return
      }

      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      })

      const response = await fetch('/api/admin/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      })

      if (response.ok) {
        setNotificationsEnabled(true)
        localStorage.setItem('notifications-enabled', 'true')
        alert('Notifiche abilitate. Riceverai avvisi per le nuove prenotazioni.')
      } else {
        alert('Errore nel salvare la subscription')
      }
    } catch (error) {
      console.error('Notification error:', error)
      alert('Errore nell abilitazione notifiche: ' + (error as Error).message)
    } finally {
      setNotificationsLoading(false)
    }
  }

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  const exportToCSV = () => {
    const headers = ['Booking Number', 'Nome', 'Email', 'Telefono', 'Camera', 'Check-in', 'Check-out', 'Ospiti', 'Totale']
    const rows = filteredBookings.map(booking => [
      booking.booking_number,
      booking.guest_name,
      booking.guest_email,
      booking.guest_phone,
      booking.room_type,
      formatDate(booking.check_in),
      formatDate(booking.check_out),
      booking.guests_count,
      booking.total_amount,
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `prenotazioni-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const resetRoomForm = () => {
    setEditingRoomId(null)
    setRoomForm(emptyRoomForm)
  }

  const editRoom = (room: Room) => {
    setEditingRoomId(room.id)
    setRoomForm(roomToForm(room))
    setActiveTab('rooms')
  }

  const saveRoom = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)

    try {
      const payload = {
        name: roomForm.name,
        type: roomForm.type,
        description: roomForm.description,
        pricePerNight: Number(roomForm.pricePerNight),
        maxGuests: Number(roomForm.maxGuests),
        size: roomForm.size,
        bedType: roomForm.bedType,
        amenities: splitLines(roomForm.amenitiesText),
        imageUrls: splitLines(roomForm.imageUrlsText),
        available: roomForm.available,
      }

      const response = await fetch(editingRoomId ? `/api/admin/rooms/${editingRoomId}` : '/api/admin/rooms', {
        method: editingRoomId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok) {
        alert(data.error || 'Errore nel salvataggio della stanza')
        return
      }

      resetRoomForm()
      await fetchAdminData()
      alert('Stanza salvata con successo')
    } finally {
      setSaving(false)
    }
  }

  const hideRoom = async (room: Room) => {
    if (!confirm(`Nascondere ${room.name} dal sito e dal booking?`)) return

    const response = await fetch(`/api/admin/rooms/${room.id}`, { method: 'DELETE' })
    if (response.ok) {
      await fetchAdminData()
    } else {
      alert('Errore nel nascondere la stanza')
    }
  }

  const saveSettings = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!settingsForm) return
    setSaving(true)

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      })

      const data = await response.json()
      if (!response.ok) {
        alert(data.error || 'Errore nel salvataggio impostazioni')
        return
      }

      setSettingsForm(data.settings)
      alert('Impostazioni salvate con successo')
    } finally {
      setSaving(false)
    }
  }

  const tabButton = (tab: AdminTab, label: string, Icon: typeof Calendar) => (
    <Button
      variant={activeTab === tab ? 'default' : 'outline'}
      onClick={() => setActiveTab(tab)}
      className="flex items-center gap-2"
    >
      <Icon className="w-4 h-4" />
      {label}
    </Button>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AuRooms Admin</h1>
            <p className="text-sm text-gray-600">Pannello di Amministrazione</p>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Esci
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Prenotazioni Totali</CardTitle>
              <Calendar className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Fatturato Totale</CardTitle>
              <DollarSign className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Check-in Prossimi</CardTitle>
              <Users className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingCheckIns}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <BellRing className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Notifiche Push</h3>
                  <p className="text-sm text-gray-600">
                    {notificationsEnabled
                      ? 'Ricevi notifiche istantanee per le nuove prenotazioni'
                      : 'Abilita per ricevere notifiche quando arriva una prenotazione'}
                  </p>
                </div>
              </div>

              {!notificationsEnabled ? (
                <Button onClick={enableNotifications} disabled={notificationsLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <BellRing className="w-5 h-5 mr-2" />
                  {notificationsLoading ? 'Attivazione...' : 'Abilita Notifiche'}
                </Button>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 bg-green-100 border-2 border-green-300 rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-800 font-semibold">Notifiche Attive</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3 mb-6">
          {tabButton('bookings', 'Prenotazioni', Calendar)}
          {tabButton('rooms', 'Stanze', BedDouble)}
          {tabButton('settings', 'Impostazioni', Settings)}
        </div>

        {activeTab === 'bookings' && (
          <>
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex flex-1 gap-4 w-full sm:w-auto">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Cerca per nome, email o numero prenotazione..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <select
                      value={filterRoom}
                      onChange={(event) => setFilterRoom(event.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="all">Tutte le camere</option>
                      {roomTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchAdminData} className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Aggiorna
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportToCSV} className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Esporta CSV
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                        {filteredBookings.map(booking => (
                          <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm font-medium text-primary-600">{booking.booking_number}</td>
                            <td className="py-3 px-4">
                              <div className="text-sm font-medium text-gray-900">{booking.guest_name}</div>
                              <div className="text-xs text-gray-500">{booking.guest_email}</div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-900">{booking.room_type}</td>
                            <td className="py-3 px-4 text-sm text-gray-900">{formatDate(booking.check_in)}</td>
                            <td className="py-3 px-4 text-sm text-gray-900">{formatDate(booking.check_out)}</td>
                            <td className="py-3 px-4 text-sm text-gray-900">{booking.guests_count}</td>
                            <td className="py-3 px-4 text-sm font-medium text-gray-900">{formatCurrency(Number(booking.total_amount))}</td>
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
                                  onClick={() => handleDeleteBooking(booking.id)}
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
          </>
        )}

        {activeTab === 'rooms' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Stanze ({rooms.length})</CardTitle>
                <Button variant="outline" size="sm" onClick={resetRoomForm} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Nuova stanza
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Nome</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Slug</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Prezzo</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Ospiti</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Stato</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rooms.map(room => (
                        <tr key={room.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">{room.name}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{room.type}</td>
                          <td className="py-3 px-4 text-sm text-gray-900">{formatCurrency(room.pricePerNight)}</td>
                          <td className="py-3 px-4 text-sm text-gray-900">{room.maxGuests}</td>
                          <td className="py-3 px-4 text-sm">
                            <span className={room.available ? 'text-green-700' : 'text-gray-500'}>
                              {room.available ? 'Visibile' : 'Nascosta'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => editRoom(room)}>
                                Modifica
                              </Button>
                              {room.available && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => hideRoom(room)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  Nascondi
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{editingRoomId ? 'Modifica stanza' : 'Nuova stanza'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={saveRoom} className="space-y-4">
                  <Input placeholder="Nome stanza" value={roomForm.name} onChange={event => setRoomForm({ ...roomForm, name: event.target.value })} required />
                  <Input placeholder="Slug/tipo (es. blue-room)" value={roomForm.type} onChange={event => setRoomForm({ ...roomForm, type: event.target.value })} required />
                  <textarea
                    placeholder="Descrizione"
                    value={roomForm.description}
                    onChange={event => setRoomForm({ ...roomForm, description: event.target.value })}
                    className="w-full min-h-24 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input type="number" min="0" step="0.01" placeholder="Prezzo notte" value={roomForm.pricePerNight} onChange={event => setRoomForm({ ...roomForm, pricePerNight: Number(event.target.value) })} required />
                    <Input type="number" min="1" placeholder="Max ospiti" value={roomForm.maxGuests} onChange={event => setRoomForm({ ...roomForm, maxGuests: Number(event.target.value) })} required />
                  </div>
                  <Input placeholder="Dimensione (es. 25 sqm)" value={roomForm.size} onChange={event => setRoomForm({ ...roomForm, size: event.target.value })} />
                  <Input placeholder="Letti" value={roomForm.bedType} onChange={event => setRoomForm({ ...roomForm, bedType: event.target.value })} />
                  <textarea
                    placeholder="Servizi, uno per riga"
                    value={roomForm.amenitiesText}
                    onChange={event => setRoomForm({ ...roomForm, amenitiesText: event.target.value })}
                    className="w-full min-h-24 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <textarea
                    placeholder="Immagini, una URL o percorso per riga"
                    value={roomForm.imageUrlsText}
                    onChange={event => setRoomForm({ ...roomForm, imageUrlsText: event.target.value })}
                    className="w-full min-h-24 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    required
                  />
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={roomForm.available}
                      onChange={event => setRoomForm({ ...roomForm, available: event.target.checked })}
                      className="h-4 w-4"
                    />
                    Visibile nel sito e nel booking
                  </label>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={saving} className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      {saving ? 'Salvataggio...' : 'Salva'}
                    </Button>
                    {editingRoomId && (
                      <Button type="button" variant="outline" onClick={resetRoomForm}>
                        Annulla
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && settingsForm && (
          <Card>
            <CardHeader>
              <CardTitle>Impostazioni contatti</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Nome struttura" value={settingsForm.businessName} onChange={event => setSettingsForm({ ...settingsForm, businessName: event.target.value })} />
                <Input placeholder="Nome breve" value={settingsForm.shortName} onChange={event => setSettingsForm({ ...settingsForm, shortName: event.target.value })} />
                <Input placeholder="Tagline" value={settingsForm.tagline} onChange={event => setSettingsForm({ ...settingsForm, tagline: event.target.value })} className="md:col-span-2" />
                <textarea
                  placeholder="Descrizione footer/SEO"
                  value={settingsForm.description}
                  onChange={event => setSettingsForm({ ...settingsForm, description: event.target.value })}
                  className="md:col-span-2 w-full min-h-24 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <Input placeholder="Indirizzo" value={settingsForm.addressLine} onChange={event => setSettingsForm({ ...settingsForm, addressLine: event.target.value })} />
                <Input placeholder="CAP" value={settingsForm.postalCode} onChange={event => setSettingsForm({ ...settingsForm, postalCode: event.target.value })} />
                <Input placeholder="Citta" value={settingsForm.city} onChange={event => setSettingsForm({ ...settingsForm, city: event.target.value })} />
                <Input placeholder="Provincia" value={settingsForm.province} onChange={event => setSettingsForm({ ...settingsForm, province: event.target.value })} />
                <Input placeholder="Paese" value={settingsForm.country} onChange={event => setSettingsForm({ ...settingsForm, country: event.target.value })} />
                <Input placeholder="Distanza aeroporto" value={settingsForm.airportDistanceLabel} onChange={event => setSettingsForm({ ...settingsForm, airportDistanceLabel: event.target.value })} />
                <Input placeholder="Telefono visibile" value={settingsForm.phoneDisplay} onChange={event => setSettingsForm({ ...settingsForm, phoneDisplay: event.target.value })} />
                <Input placeholder="Telefono link tel:" value={settingsForm.phoneHref} onChange={event => setSettingsForm({ ...settingsForm, phoneHref: event.target.value })} />
                <Input placeholder="Numero WhatsApp" value={settingsForm.whatsappNumber} onChange={event => setSettingsForm({ ...settingsForm, whatsappNumber: event.target.value })} />
                <Input placeholder="Email" value={settingsForm.email} onChange={event => setSettingsForm({ ...settingsForm, email: event.target.value })} />
                <Input placeholder="Google Maps URL" value={settingsForm.mapsUrl} onChange={event => setSettingsForm({ ...settingsForm, mapsUrl: event.target.value })} className="md:col-span-2" />
                <Input placeholder="Sito web" value={settingsForm.websiteUrl} onChange={event => setSettingsForm({ ...settingsForm, websiteUrl: event.target.value })} />
                <Input placeholder="Instagram URL" value={settingsForm.instagramUrl} onChange={event => setSettingsForm({ ...settingsForm, instagramUrl: event.target.value })} />
                <Input placeholder="Facebook URL" value={settingsForm.facebookUrl} onChange={event => setSettingsForm({ ...settingsForm, facebookUrl: event.target.value })} />
                <Input placeholder="Check-in HH:MM" value={settingsForm.checkInTime} onChange={event => setSettingsForm({ ...settingsForm, checkInTime: event.target.value })} />
                <Input placeholder="Check-out HH:MM" value={settingsForm.checkOutTime} onChange={event => setSettingsForm({ ...settingsForm, checkOutTime: event.target.value })} />
                <div className="md:col-span-2">
                  <Button type="submit" disabled={saving} className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {saving ? 'Salvataggio...' : 'Salva impostazioni'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
