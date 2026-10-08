import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_ROUTES = [
  '/card-test',
  '/profile',
  '/wallet',
  '/gmail',
  '/statements',
  '/subscription',
  '/max-pro',
  '/settings',
  '/complete-profile',
  '/consent-onboarding',
  '/cards',
  '/manual',
  '/results',
  '/notifications'
]

export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  const pathname = request.nextUrl.pathname
  requestHeaders.set('x-pathname', pathname)

  const isProtected = PROTECTED_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))
  const token = request.cookies.get('payload-token')?.value

  if (isProtected && !token) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
