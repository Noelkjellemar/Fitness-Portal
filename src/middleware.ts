import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Role-based route protection
    if (pathname.startsWith('/admin')) {
      if (token?.role !== 'main-coach') {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    if (pathname.startsWith('/coach')) {
      if (token?.role !== 'coach' && token?.role !== 'main-coach') {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    if (pathname.startsWith('/client')) {
      if (token?.role !== 'client') {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/coach/:path*', '/client/:path*'],
}
