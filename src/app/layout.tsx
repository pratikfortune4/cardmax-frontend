import React from 'react'
import { headers as getHeaders, cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { hasRequiredConsent } from '@/lib/guard'
import { API_BASE_URL } from '@/lib/api'
import { PolicyBanner } from '@/components/PolicyBanner'
import { Navbar, type NavbarUser } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import './styles.scss'

export const metadata = {
  description: 'CardMax — Smart credit card rewards and optimization platform.',
  title: 'CardMax',
}

const EXEMPT_PATHS = [
  '/login',
  '/logout',
  '/consent-onboarding',
  '/terms-and-conditions',
  '/privacy-and-policy',
]

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  const headers = await getHeaders()
  const pathname = headers.get('x-pathname') || ''
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()

  let currentUser: NavbarUser | null = null

  if (cookieStore.has('payload-token')) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/me`, {
        headers: {
          Cookie: cookieHeader,
        },
        cache: 'no-store',
      })

      if (res.ok) {
        const data = await res.json()
        const user = data?.user

        if (user) {
          currentUser = {
            id: String(user.id),
            email: user.email,
            name: user.name || user.firstName || null,
            isPro: user.isPro ?? false,
          }

          const hasConsent = hasRequiredConsent(user)

          // If user lacks required consent and is attempting to access protected pages -> block and redirect
          if (!hasConsent && !EXEMPT_PATHS.includes(pathname)) {
            redirect('/consent-onboarding')
          }

          // If user already has required consent and tries to visit /consent-onboarding -> return to app
          if (hasConsent && pathname === '/consent-onboarding') {
            redirect('/')
          }
        }
      }
    } catch (e: any) {
      // In Next.js redirect() throws a special NEXT_REDIRECT error which must be re-thrown
      if (e?.digest?.startsWith('NEXT_REDIRECT')) {
        throw e
      }
    }
  }

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className="cm-app-body">
        <PolicyBanner />
        <Navbar initialUser={currentUser} />
        <main className="cm-app-main">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
