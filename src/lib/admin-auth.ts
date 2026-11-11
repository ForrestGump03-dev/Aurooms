import crypto from 'crypto'
import { SignJWT, jwtVerify } from 'jose'
import { query } from './db'

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

/**
 * Constant-time string comparison using SHA-256 digests so neither content nor length is leaked.
 */
export function timingSafeCompare(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(String(a)).digest()
  const hashB = crypto.createHash('sha256').update(String(b)).digest()
  return crypto.timingSafeEqual(hashA, hashB)
}

/**
 * Hashes a password with Node's built-in cryptographic scrypt KDF.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex')
  return `scrypt:${salt}:${derivedKey}`
}

/**
 * Verifies a plaintext password against a stored scrypt hash in constant time.
 */
export function verifyPasswordHash(password: string, storedHash: string): boolean {
  try {
    const parts = storedHash.split(':')
    if (parts.length !== 3 || parts[0] !== 'scrypt') {
      return false
    }
    const [, salt, keyHex] = parts
    const keyBuffer = Buffer.from(keyHex, 'hex')
    const derivedBuffer = crypto.scryptSync(password, salt, 64)
    if (keyBuffer.length !== derivedBuffer.length) {
      return false
    }
    return crypto.timingSafeEqual(keyBuffer, derivedBuffer)
  } catch {
    return false
  }
}

export interface AdminCredentialsState {
  passwordHash: string | null
  sessionVersion: number
  passwordUpdatedAt: string | null
}

export async function getAdminCredentialsState(): Promise<AdminCredentialsState> {
  try {
    const result = await query(
      `SELECT password_hash, session_version, password_updated_at
       FROM admin_credentials
       WHERE id = 1`
    )
    if (!result.rows.length) {
      return { passwordHash: null, sessionVersion: 1, passwordUpdatedAt: null }
    }
    const row = result.rows[0]
    return {
      passwordHash: row.password_hash || null,
      sessionVersion: Number(row.session_version || 1),
      passwordUpdatedAt: row.password_updated_at ? new Date(row.password_updated_at).toISOString() : null,
    }
  } catch (error) {
    console.error('Failed to read admin_credentials:', error)
    return { passwordHash: null, sessionVersion: 1, passwordUpdatedAt: null }
  }
}

/**
 * Verifies the admin password:
 * - If a custom password hash has been set in `admin_credentials`, verifies against the DB hash.
 * - Otherwise (initial state), verifies against `process.env.ADMIN_PASSWORD` in constant time.
 */
export async function verifyAdminPassword(
  password: string
): Promise<{ valid: boolean; sessionVersion: number; usingDatabaseHash: boolean }> {
  const state = await getAdminCredentialsState()

  if (state.passwordHash) {
    const valid = verifyPasswordHash(password, state.passwordHash)
    return {
      valid,
      sessionVersion: state.sessionVersion,
      usingDatabaseHash: true,
    }
  }

  const envPassword = getAdminPassword()
  const valid = timingSafeCompare(password, envPassword)
  return {
    valid,
    sessionVersion: state.sessionVersion,
    usingDatabaseHash: false,
  }
}

export async function signAdminToken(sessionVersion = 1): Promise<string> {
  return new SignJWT({ admin: true, sessionVersion })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getJwtSecret())
}

/**
 * Updates the admin password hash in PostgreSQL, clears any pending reset token,
 * and increments `session_version` to immediately revoke all previously issued tokens.
 */
export async function updateAdminPassword(newPassword: string): Promise<{ sessionVersion: number }> {
  const newHash = hashPassword(newPassword)
  const result = await query(
    `INSERT INTO admin_credentials (
       id, password_hash, session_version, reset_token_hash, reset_token_expires_at, password_updated_at, updated_at
     ) VALUES (
       1, $1, 2, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
     )
     ON CONFLICT (id) DO UPDATE SET
       password_hash = EXCLUDED.password_hash,
       session_version = admin_credentials.session_version + 1,
       reset_token_hash = NULL,
       reset_token_expires_at = NULL,
       password_updated_at = CURRENT_TIMESTAMP,
       updated_at = CURRENT_TIMESTAMP
     RETURNING session_version`,
    [newHash]
  )

  return {
    sessionVersion: Number(result.rows[0]?.session_version || 2),
  }
}

/**
 * Generates a single-use 256-bit reset token, stores only its SHA-256 hash in DB (valid for 20 minutes),
 * and returns the raw token to be sent via email.
 */
export async function createAdminPasswordResetToken(): Promise<{ token: string; expiresAt: Date }> {
  const rawToken = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
  const expiresAt = new Date(Date.now() + 20 * 60 * 1000) // 20 minutes

  await query(
    `INSERT INTO admin_credentials (
       id, reset_token_hash, reset_token_expires_at, updated_at
     ) VALUES (
       1, $1, $2, CURRENT_TIMESTAMP
     )
     ON CONFLICT (id) DO UPDATE SET
       reset_token_hash = EXCLUDED.reset_token_hash,
       reset_token_expires_at = EXCLUDED.reset_token_expires_at,
       updated_at = CURRENT_TIMESTAMP`,
    [tokenHash, expiresAt]
  )

  return { token: rawToken, expiresAt }
}

/**
 * Validates and consumes a password reset token, updating the admin password hash
 * and incrementing `session_version`.
 */
export async function consumeAdminPasswordResetToken(
  rawToken: string,
  newPassword: string
): Promise<{ success: boolean; error?: string; sessionVersion?: number }> {
  if (!rawToken || typeof rawToken !== 'string' || rawToken.length < 32) {
    return { success: false, error: 'Token di reset non valido' }
  }

  const result = await query(
    `SELECT reset_token_hash, reset_token_expires_at
     FROM admin_credentials
     WHERE id = 1`
  )

  if (!result.rows.length || !result.rows[0].reset_token_hash || !result.rows[0].reset_token_expires_at) {
    return { success: false, error: 'Link di reset non valido o già utilizzato' }
  }

  const row = result.rows[0]
  const expiresAt = new Date(row.reset_token_expires_at)
  if (expiresAt.getTime() < Date.now()) {
    return { success: false, error: 'Il link di reset è scaduto. Richiedine uno nuovo.' }
  }

  const incomingHash = crypto.createHash('sha256').update(rawToken.trim()).digest('hex')
  if (!timingSafeCompare(incomingHash, String(row.reset_token_hash))) {
    return { success: false, error: 'Token di reset non valido' }
  }

  const { sessionVersion } = await updateAdminPassword(newPassword)
  return { success: true, sessionVersion }
}

/**
 * Verifies the JWT signature and checks that `sessionVersion` matches the current DB `session_version`.
 */
export async function verifyAdminToken(token?: string): Promise<boolean> {
  if (!token) return false

  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    const state = await getAdminCredentialsState()
    const tokenVersion = typeof payload.sessionVersion === 'number' ? payload.sessionVersion : 1
    return tokenVersion === state.sessionVersion
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
