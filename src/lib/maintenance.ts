import { NextResponse } from 'next/server'
import { getSiteSettings, SiteSettings } from './site-settings'
import { extractAdminToken, verifyAdminToken } from './admin-auth'

/**
 * Checks if maintenance mode is active.
 * 1. An environment variable `MAINTENANCE_MODE=true` forces maintenance mode ON.
 * 2. An environment variable `MAINTENANCE_MODE=false` forces maintenance mode OFF.
 * 3. Otherwise, the database setting in `site_settings.maintenance_mode` is used.
 */
export async function isMaintenanceActive(cachedSettings?: SiteSettings): Promise<boolean> {
  const envMode = process.env.MAINTENANCE_MODE?.toLowerCase().trim()
  if (envMode === 'true' || envMode === '1') {
    return true
  }
  if (envMode === 'false' || envMode === '0') {
    return false
  }

  try {
    const settings = cachedSettings || await getSiteSettings()
    return Boolean(settings.maintenanceMode)
  } catch (error) {
    console.error('Error checking maintenance mode:', error)
    return false
  }
}

/**
 * Synchronous check for Edge Middleware or runtime where settings object or env is already loaded.
 */
export function isMaintenanceActiveSync(settings?: SiteSettings): boolean {
  const envMode = process.env.MAINTENANCE_MODE?.toLowerCase().trim()
  if (envMode === 'true' || envMode === '1') {
    return true
  }
  if (envMode === 'false' || envMode === '0') {
    return false
  }
  return Boolean(settings?.maintenanceMode)
}

/**
 * Helper to check if a backend API request should be blocked.
 * Admins with a valid JWT token bypass maintenance block.
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
