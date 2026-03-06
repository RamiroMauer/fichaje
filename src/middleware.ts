import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken, SESSION_COOKIE_NAME } from '@/lib/auth'

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Solo aplica a rutas /admin/* (excepto /admin/login)
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)

        if (!sessionCookie || !verifyToken(sessionCookie.value)) {
            const loginUrl = new URL('/admin/login', request.url)
            // Guardamos la URL de destino para redirigir después del login
            loginUrl.searchParams.set('from', pathname)
            return NextResponse.redirect(loginUrl)
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*'],
}
