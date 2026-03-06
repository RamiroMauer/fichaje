import { createHmac, timingSafeEqual } from 'crypto'

const SESSION_COOKIE = 'admin_session'
const SESSION_DURATION_HOURS = 8

function getSecret(): string {
    const secret = process.env.ADMIN_SESSION_SECRET
    if (!secret) throw new Error('ADMIN_SESSION_SECRET is not set')
    return secret
}

/** Genera un token firmado con HMAC-SHA256 */
export function signToken(payload: string): string {
    const secret = getSecret()
    const hmac = createHmac('sha256', secret)
    hmac.update(payload)
    const sig = hmac.digest('hex')
    return `${payload}.${sig}`
}

/** Verifica token en Node.js runtime (Server Actions, Server Components) */
export function verifyToken(token: string): boolean {
    try {
        const lastDot = token.lastIndexOf('.')
        if (lastDot === -1) return false

        const payload = token.substring(0, lastDot)
        const sig = token.substring(lastDot + 1)

        const secret = getSecret()
        const hmac = createHmac('sha256', secret)
        hmac.update(payload)
        const expectedSig = hmac.digest('hex')

        if (sig.length !== expectedSig.length) return false
        const sigBuf = Buffer.from(sig)
        const expectedBuf = Buffer.from(expectedSig)
        if (!timingSafeEqual(sigBuf, expectedBuf)) return false

        const parts = payload.split(':')
        const expiresAt = parseInt(parts[1], 10)
        return Date.now() < expiresAt
    } catch {
        return false
    }
}

/** 
 * Verifica token en Edge Runtime (Middleware de Next.js).
 * Edge no tiene `crypto` de Node.js — usa la Web Crypto API.
 */
export async function verifyTokenEdge(token: string, secret: string): Promise<boolean> {
    try {
        const lastDot = token.lastIndexOf('.')
        if (lastDot === -1) return false

        const payload = token.substring(0, lastDot)
        const sig = token.substring(lastDot + 1)

        const enc = new TextEncoder()
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            enc.encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        )
        const sigBytes = await crypto.subtle.sign('HMAC', keyMaterial, enc.encode(payload))
        const expectedSig = [...new Uint8Array(sigBytes)]
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')

        if (sig !== expectedSig) return false

        const parts = payload.split(':')
        const expiresAt = parseInt(parts[1], 10)
        return Date.now() < expiresAt
    } catch {
        return false
    }
}

/** Crea un token de sesión con expiración */
export function createSessionToken(): string {
    const expiresAt = Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000
    const random = Math.random().toString(36).substring(2)
    const payload = `admin:${expiresAt}:${random}`
    return signToken(payload)
}

/** Nombre de la cookie de sesión */
export const SESSION_COOKIE_NAME = SESSION_COOKIE

/** Opciones base de la cookie de sesión */
export function getSessionCookieOptions() {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        maxAge: SESSION_DURATION_HOURS * 60 * 60,
        path: '/',
    }
}
