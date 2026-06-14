import { query } from './db'

export interface SiteSettings {
  businessName: string
  shortName: string
  tagline: string
  description: string
  addressLine: string
  postalCode: string
  city: string
  province: string
  country: string
  phoneDisplay: string
  phoneHref: string
  whatsappNumber: string
  whatsappUrl: string
  email: string
  mapsUrl: string
  airportDistanceLabel: string
  websiteUrl: string
  instagramUrl: string
  facebookUrl: string
  checkInTime: string
  checkOutTime: string
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  businessName: 'AuRooms Guest House',
  shortName: 'AuRooms',
  tagline: 'Luxury Guest House - Cinisi, Sicily',
  description: 'Experience authentic Sicilian luxury just 3km from Palermo Airport. Your perfect gateway to discovering the beauty of Sicily.',
  addressLine: 'Piazza Pietro Venuti, 12',
  postalCode: '90045',
  city: 'Cinisi',
  province: 'PA',
  country: 'Italy',
  phoneDisplay: '+39 375 884 3175',
  phoneHref: '+393758843175',
  whatsappNumber: '393758843175',
  whatsappUrl: 'https://wa.me/393758843175',
  email: 'info@aurooms.it',
  mapsUrl: 'https://maps.app.goo.gl/GyEnYbbnxYT872uA9',
  airportDistanceLabel: '3km from Palermo Airport',
  websiteUrl: 'https://aurooms.it',
  instagramUrl: '',
  facebookUrl: '',
  checkInTime: '15:00',
  checkOutTime: '11:00',
}

function rowToSettings(row: any): SiteSettings {
  return {
    businessName: row.business_name,
    shortName: row.short_name,
    tagline: row.tagline,
    description: row.description,
    addressLine: row.address_line,
    postalCode: row.postal_code,
    city: row.city,
    province: row.province,
    country: row.country,
    phoneDisplay: row.phone_display,
    phoneHref: row.phone_href,
    whatsappNumber: row.whatsapp_number,
    whatsappUrl: row.whatsapp_url,
    email: row.email,
    mapsUrl: row.maps_url,
    airportDistanceLabel: row.airport_distance_label,
    websiteUrl: row.website_url,
    instagramUrl: row.instagram_url || '',
    facebookUrl: row.facebook_url || '',
    checkInTime: row.check_in_time,
    checkOutTime: row.check_out_time,
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const result = await query('SELECT * FROM site_settings WHERE id = 1')
    if (!result.rows.length) return DEFAULT_SITE_SETTINGS
    return rowToSettings(result.rows[0])
  } catch (error) {
    console.error('Failed to load site settings:', error)
    return DEFAULT_SITE_SETTINGS
  }
}

function cleanString(value: unknown, fallback: string, maxLength = 500): string {
  const cleaned = String(value ?? '').trim()
  if (!cleaned) return fallback
  return cleaned.slice(0, maxLength)
}

function normalizePhoneHref(value: string): string {
  return value.replace(/[^\d+]/g, '')
}

function normalizeWhatsApp(value: string): { number: string; url: string } {
  const number = value.replace(/[^\d]/g, '')
  return {
    number,
    url: number ? `https://wa.me/${number}` : '',
  }
}

function validateOptionalUrl(value: string): boolean {
  if (!value) return true
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

export function validateSiteSettingsPayload(input: any): { settings?: SiteSettings; error?: string } {
  const fallback = DEFAULT_SITE_SETTINGS
  const whatsappInput = cleanString(input?.whatsappNumber || input?.whatsappUrl, fallback.whatsappNumber, 50)
  const whatsapp = normalizeWhatsApp(whatsappInput)

  const settings: SiteSettings = {
    businessName: cleanString(input?.businessName, fallback.businessName, 120),
    shortName: cleanString(input?.shortName, fallback.shortName, 60),
    tagline: cleanString(input?.tagline, fallback.tagline, 180),
    description: cleanString(input?.description, fallback.description, 600),
    addressLine: cleanString(input?.addressLine, fallback.addressLine, 180),
    postalCode: cleanString(input?.postalCode, fallback.postalCode, 20),
    city: cleanString(input?.city, fallback.city, 80),
    province: cleanString(input?.province, fallback.province, 40),
    country: cleanString(input?.country, fallback.country, 80),
    phoneDisplay: cleanString(input?.phoneDisplay, fallback.phoneDisplay, 50),
    phoneHref: normalizePhoneHref(cleanString(input?.phoneHref || input?.phoneDisplay, fallback.phoneHref, 50)),
    whatsappNumber: whatsapp.number || fallback.whatsappNumber,
    whatsappUrl: whatsapp.url || fallback.whatsappUrl,
    email: cleanString(input?.email, fallback.email, 120).toLowerCase(),
    mapsUrl: cleanString(input?.mapsUrl, fallback.mapsUrl, 500),
    airportDistanceLabel: cleanString(input?.airportDistanceLabel, fallback.airportDistanceLabel, 120),
    websiteUrl: cleanString(input?.websiteUrl, fallback.websiteUrl, 200),
    instagramUrl: cleanString(input?.instagramUrl, '', 200),
    facebookUrl: cleanString(input?.facebookUrl, '', 200),
    checkInTime: cleanString(input?.checkInTime, fallback.checkInTime, 5),
    checkOutTime: cleanString(input?.checkOutTime, fallback.checkOutTime, 5),
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)) {
    return { error: 'Email non valida' }
  }

  for (const field of ['mapsUrl', 'websiteUrl', 'instagramUrl', 'facebookUrl'] as const) {
    if (!validateOptionalUrl(settings[field])) {
      return { error: `URL non valido: ${field}` }
    }
  }

  if (!/^\d{2}:\d{2}$/.test(settings.checkInTime) || !/^\d{2}:\d{2}$/.test(settings.checkOutTime)) {
    return { error: 'Orari non validi. Usa formato HH:MM' }
  }

  return { settings }
}

export async function saveSiteSettings(settings: SiteSettings): Promise<SiteSettings> {
  const result = await query(
    `INSERT INTO site_settings (
       id, business_name, short_name, tagline, description, address_line, postal_code,
       city, province, country, phone_display, phone_href, whatsapp_number, whatsapp_url,
       email, maps_url, airport_distance_label, website_url, instagram_url, facebook_url,
       check_in_time, check_out_time, updated_at
     ) VALUES (
       1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
       $17, $18, $19, $20, $21, CURRENT_TIMESTAMP
     )
     ON CONFLICT (id) DO UPDATE SET
       business_name = EXCLUDED.business_name,
       short_name = EXCLUDED.short_name,
       tagline = EXCLUDED.tagline,
       description = EXCLUDED.description,
       address_line = EXCLUDED.address_line,
       postal_code = EXCLUDED.postal_code,
       city = EXCLUDED.city,
       province = EXCLUDED.province,
       country = EXCLUDED.country,
       phone_display = EXCLUDED.phone_display,
       phone_href = EXCLUDED.phone_href,
       whatsapp_number = EXCLUDED.whatsapp_number,
       whatsapp_url = EXCLUDED.whatsapp_url,
       email = EXCLUDED.email,
       maps_url = EXCLUDED.maps_url,
       airport_distance_label = EXCLUDED.airport_distance_label,
       website_url = EXCLUDED.website_url,
       instagram_url = EXCLUDED.instagram_url,
       facebook_url = EXCLUDED.facebook_url,
       check_in_time = EXCLUDED.check_in_time,
       check_out_time = EXCLUDED.check_out_time,
       updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [
      settings.businessName,
      settings.shortName,
      settings.tagline,
      settings.description,
      settings.addressLine,
      settings.postalCode,
      settings.city,
      settings.province,
      settings.country,
      settings.phoneDisplay,
      settings.phoneHref,
      settings.whatsappNumber,
      settings.whatsappUrl,
      settings.email,
      settings.mapsUrl,
      settings.airportDistanceLabel,
      settings.websiteUrl,
      settings.instagramUrl || null,
      settings.facebookUrl || null,
      settings.checkInTime,
      settings.checkOutTime,
    ]
  )

  return rowToSettings(result.rows[0])
}

export function fullAddress(settings: SiteSettings): string {
  return `${settings.addressLine}, ${settings.postalCode} ${settings.city} ${settings.province}`.trim()
}
