import { NextResponse } from 'next/server'
import { getSiteSettings, SiteSettings } from './site-settings'
import { extractAdminToken, verifyAdminToken } from './admin-auth'

/**
 * Checks if maintenance mode is active using the bidirectional "last update wins"
 * state synchronized between `MAINTENANCE_MODE` in `.env` and `site_settings.maintenance_mode`.
 */
export async function isMaintenanceActive(cachedSettings?: SiteSettings): Promise<boolean> {
  try {
    const settings = cachedSettings || (await getSiteSettings())
    return Boolean(settings.maintenanceMode)
  } catch (error) {
    console.error('Error checking maintenance mode:', error)
    return false
  }
}

/**
 * Synchronous check when settings object is already loaded.
 */
export function isMaintenanceActiveSync(settings?: SiteSettings): boolean {
  return Boolean(settings?.maintenanceMode)
}

/**
 * Helper to check if a backend API request should be blocked.
 * Admins with a valid JWT token (and valid session_version) bypass maintenance block.
 */
export async function shouldBlockApiForMaintenance(request: Request): Promise<boolean> {
  const active = await isMaintenanceActive()
  if (!active) return false

  const token = extractAdminToken(request)
  if (token && (await verifyAdminToken(token))) {
    return false // Admin has access
  }

  return true // Block non-admin request
}

/**
 * Standard 503 JSON response for blocked API requests.
 */
export function getMaintenanceApiResponse(customMessage?: string) {
  return NextResponse.json(
    {
      error: customMessage || 'Service temporarily under maintenance. Please try again later.',
      maintenance: true,
    },
    {
      status: 503,
      headers: {
        'Retry-After': '3600',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  )
}
