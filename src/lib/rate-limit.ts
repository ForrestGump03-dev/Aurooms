import { query } from './db'

export interface RateLimitOptions {
  maxAttempts: number
  windowMs: number
  blockDurationMs: number
}

export interface RateLimitResult {
  allowed: boolean
  remainingAttempts: number
  retryAfterSeconds?: number
}

export function getClientIp(request: Request): string {
  const vercelForwarded = request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()
  if (vercelForwarded) return vercelForwarded.slice(0, 80)

  const realIp = request.headers.get('x-real-ip')?.trim()
  if (realIp) return realIp.slice(0, 80)

  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  if (forwarded) return forwarded.slice(0, 80)

  return 'unknown'
}

/**
 * Persistent rate limiter backed by PostgreSQL `rate_limits` table.
 * Works reliably across Serverless lambda instances on Vercel.
 */
export async function checkPersistentRateLimit(
  key: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const safeKey = key.slice(0, 150)
  const now = new Date()

  try {
    const existingResult = await query(
      `SELECT attempts, window_start, blocked_until
       FROM rate_limits
       WHERE key = $1`,
      [safeKey]
    )

    if (existingResult.rows.length === 0) {
      await query(
        `INSERT INTO rate_limits (key, attempts, window_start, blocked_until, updated_at)
         VALUES ($1, 1, $2, NULL, $2)
         ON CONFLICT (key) DO UPDATE SET
           attempts = 1,
           window_start = $2,
           blocked_until = NULL,
           updated_at = $2`,
        [safeKey, now]
      )
      return {
        allowed: true,
        remainingAttempts: Math.max(0, options.maxAttempts - 1),
      }
    }

    const row = existingResult.rows[0]
    const blockedUntil = row.blocked_until ? new Date(row.blocked_until) : null
    const windowStart = new Date(row.window_start)

    // 1. Currently blocked
    if (blockedUntil && blockedUntil.getTime() > now.getTime()) {
      const retryAfterSeconds = Math.ceil((blockedUntil.getTime() - now.getTime()) / 1000)
      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfterSeconds,
      }
    }

    // 2. Previous window or block expired -> reset counter to 1
    if (
      (blockedUntil && blockedUntil.getTime() <= now.getTime()) ||
      now.getTime() - windowStart.getTime() > options.windowMs
    ) {
      await query(
        `UPDATE rate_limits
         SET attempts = 1,
             window_start = $2,
             blocked_until = NULL,
             updated_at = $2
         WHERE key = $1`,
        [safeKey, now]
      )
      return {
        allowed: true,
        remainingAttempts: Math.max(0, options.maxAttempts - 1),
      }
    }

    // 3. Within active window -> increment attempts
    const nextAttempts = Number(row.attempts) + 1
    if (nextAttempts > options.maxAttempts) {
      const newBlockedUntil = new Date(now.getTime() + options.blockDurationMs)
      await query(
        `UPDATE rate_limits
         SET attempts = $2,
             blocked_until = $3,
             updated_at = $4
         WHERE key = $1`,
        [safeKey, nextAttempts, newBlockedUntil, now]
      )
      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfterSeconds: Math.ceil(options.blockDurationMs / 1000),
      }
    }

    await query(
      `UPDATE rate_limits
       SET attempts = $2,
           updated_at = $3
       WHERE key = $1`,
      [safeKey, nextAttempts, now]
    )

    return {
      allowed: true,
      remainingAttempts: Math.max(0, options.maxAttempts - nextAttempts),
    }
  } catch (error) {
    console.error('Rate limit DB error (falling back to allow):', error)
    return {
      allowed: true,
      remainingAttempts: 1,
    }
  }
}

export async function clearPersistentRateLimit(key: string): Promise<void> {
  try {
    await query('DELETE FROM rate_limits WHERE key = $1', [key.slice(0, 150)])
  } catch (error) {
    console.error('Failed to clear rate limit key:', error)
  }
}

