import { IconCreditCard, IconLogOut } from '@/components/Icons';
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { API_BASE_URL, getAuthHeaders } from '@/lib/api'
import { LogoutButton } from './logout-button'
import './logout.scss'

export default async function LogoutPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value

  if (!token) {
    redirect('/login')
  }

  let userEmail = 'User'
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/me`, {
      headers: getAuthHeaders(token),
      cache: 'no-store',
    })
    if (!res.ok) {
      redirect('/login')
    }
    const data = await res.json()
    if (!data?.user) {
      redirect('/login')
    }
    userEmail = data.user.email || data.user.name || 'User'
  } catch {
    redirect('/login')
  }

  const initial = (userEmail.charAt(0) || 'U').toUpperCase()

  return (
    <main className="cm-logout-page">
      {/* Brand Header */}
      <div className="cm-logout-brand-header">
        <Link href="/" className="cm-logout-logo" aria-label="CardMax Home">
          <div className="cm-logout-logo-icon">
            <IconCreditCard />
          </div>
          <div className="cm-logout-brand-text">
            <span>Card</span>
            <span className="cm-brand-accent">Max</span>
          </div>
        </Link>
      </div>

      {/* Confirmation Card */}
      <div className="cm-logout-card">
        <div className="cm-logout-icon-wrap" aria-hidden="true">
          <IconLogOut />
        </div>

        <h1 className="cm-logout-title">Log out of CardMax</h1>
        <p className="cm-logout-description">
          Are you sure you want to log out? You will need to sign in again to access your wallet and card recommendations.
        </p>

        {/* User identification badge */}
        <div className="cm-logout-user-chip" title={userEmail}>
          <span className="cm-logout-user-avatar">{initial}</span>
          <span className="cm-logout-user-email">{userEmail}</span>
        </div>

        <LogoutButton />
      </div>
    </main>
  )
}