import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyTokenEdge, SESSION_COOKIE_NAME } from '@/lib/auth'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Solo aplica a rutas /admin/* (excepto /admin/login)
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)
        const secret = process.env.ADMIN_SESSION_SECRET || ''

        const isValid = sessionCookie
            ? await verifyTokenEdge(sessionCookie.value, secret)
            : false

        if (!isValid) {
            const loginUrl = new URL('/admin/login', request.url)
            loginUrl.searchParams.set('from', pathname)
            return NextResponse.redirect(loginUrl)
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*'],
}
