import { jwtVerify } from 'jose'

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret || secret === 'your-secret-key-change-in-production' || secret === 'your-secret-key') {
    throw new Error('JWT_SECRET is not configured')
  }
  return new TextEncoder().encode(secret)
}

export function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD
  if (!password || password === 'changeme') {
    throw new Error('ADMIN_PASSWORD is not configured')
  }
  return password
}

export async function verifyAdminToken(token?: string): Promise<boolean> {
  if (!token) return false

  try {
    await jwtVerify(token, getJwtSecret())
    return true
  } catch {
    return false
  }
}

export function extractAdminToken(request: Request): string | undefined {
  return request.headers.get('cookie')?.match(/admin-token=([^;]+)/)?.[1]
}

export async function isAdminRequest(request: Request): Promise<boolean> {
  return verifyAdminToken(extractAdminToken(request))
}

export function getSigningSecret(): Uint8Array {
  return getJwtSecret()
}

export function assertSameOrigin(request: Request): boolean {
  const requestUrl = new URL(request.url)
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  if (origin) {
    return origin === requestUrl.origin
  }

  if (referer) {
    try {
      return new URL(referer).origin === requestUrl.origin
    } catch {
      return false
    }
  }

  return false
}
