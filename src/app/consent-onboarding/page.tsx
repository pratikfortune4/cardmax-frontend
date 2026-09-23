import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { API_BASE_URL, getAuthHeaders } from '@/lib/api'
import { hasRequiredConsent } from '@/lib/guard'
import { ConsentOnboardingForm } from './consent-onboarding-form'
import './styles.scss'

export const metadata = {
  title: 'Welcome to CardMax — Required Terms & Privacy',
  description: 'Please review and accept our Terms of Service and Privacy Notice to continue.',
}

export default async function ConsentOnboardingPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value

  if (!token) {
    redirect('/login')
  }

  let user = null
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/me`, {
      headers: getAuthHeaders(token),
      cache: 'no-store',
    })
    if (res.ok) {
      const data = await res.json()
      user = data.user
    }
  } catch {
    // network issue
  }

  if (!user) {
    redirect('/login')
  }

  // If the user already has valid current consent, don't show the screen again
  if (hasRequiredConsent(user)) {
    redirect('/')
  }

  return (
    <div className="onboarding-page">
      <header className="onboarding-topbar">
        <span className="brand-logo">CardMax</span>
        <Link href="/logout" className="signout-link">
          Sign out
        </Link>
      </header>

      <main className="onboarding-main">
        <ConsentOnboardingForm />
      </main>
    </div>
  )
}
