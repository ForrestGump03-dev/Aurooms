import { query } from './db'

export interface RoomRow {
  id: number
  name: string
  type: string
  description: string | null
  price_per_night: string | number
  max_guests: number
  size: string | null
  bed_type: string | null
  amenities: string[] | null
  image_urls: string[] | null
  available: boolean
  created_at?: string
  updated_at?: string | null
}

export interface RoomPayload {
  name: string
  type: string
  description: string
  pricePerNight: number
  maxGuests: number
  size: string
  bedType: string
  amenities: string[]
  imageUrls: string[]
  available: boolean
}

export function mapRoomRow(row: RoomRow) {
  return {
    id: String(row.id),
    name: row.name,
    type: row.type,
    description: row.description || '',
    pricePerNight: Number(row.price_per_night),
    maxGuests: Number(row.max_guests),
    size: row.size || '',
    bedType: row.bed_type || '',
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    imageUrls: Array.isArray(row.image_urls) && row.image_urls.length ? row.image_urls : [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=2070'
    ],
    available: Boolean(row.available),
  }
}

function toCleanArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(item => String(item).trim()).filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split('\n')
      .flatMap(item => item.split(','))
      .map(item => item.trim())
      .filter(Boolean)
  }

  return []
}

function isValidImagePath(value: string): boolean {
  if (value.startsWith('/')) {
    return !value.includes('..') && value.length <= 500
  }

  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

export function validateRoomPayload(input: any): { room?: RoomPayload; error?: string } {
  const name = String(input?.name || '').trim()
  const type = String(input?.type || '').trim().toLowerCase()
  const description = String(input?.description || '').trim()
  const size = String(input?.size || '').trim()
  const bedType = String(input?.bedType ?? input?.bed_type ?? '').trim()
  const pricePerNight = Number(input?.pricePerNight ?? input?.price_per_night)
  const maxGuests = Number.parseInt(String(input?.maxGuests ?? input?.max_guests), 10)
  const amenities = toCleanArray(input?.amenities)
  const imageUrls = toCleanArray(input?.imageUrls ?? input?.image_urls)
  const available = Boolean(input?.available)

  if (!name || name.length > 100) return { error: 'Nome stanza non valido' }
  if (!/^[a-z0-9][a-z0-9-]{1,48}$/.test(type)) {
    return { error: 'Tipo/slug stanza non valido. Usa lettere, numeri e trattini.' }
  }
  if (!Number.isFinite(pricePerNight) || pricePerNight < 0 || pricePerNight > 99999) {
    return { error: 'Prezzo per notte non valido' }
  }
  if (!Number.isInteger(maxGuests) || maxGuests < 1 || maxGuests > 30) {
    return { error: 'Numero ospiti non valido' }
  }
  if (description.length > 5000) return { error: 'Descrizione troppo lunga' }
  if (amenities.some(item => item.length > 80)) return { error: 'Ogni servizio deve restare sotto 80 caratteri' }
  if (imageUrls.length === 0) return { error: 'Inserisci almeno una immagine' }
  if (imageUrls.length > 12) return { error: 'Massimo 12 immagini per stanza' }
  if (!imageUrls.every(isValidImagePath)) {
    return { error: 'Le immagini devono essere percorsi locali (/foto.jpg) o URL http/https validi' }
  }

  return {
    room: {
      name,
      type,
      description,
      pricePerNight,
      maxGuests,
      size,
      bedType,
      amenities,
      imageUrls,
      available,
    },
  }
}

export async function getAvailableRooms() {
  const result = await query(
    `SELECT id, name, type, description, price_per_night, max_guests,
            size, bed_type, amenities, image_urls, available
     FROM rooms
     WHERE available = true
     ORDER BY price_per_night ASC`
  )

  return result.rows.map(mapRoomRow)
}
