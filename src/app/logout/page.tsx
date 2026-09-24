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
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="14" x="2" y="5" rx="3" />
              <line x1="2" x2="22" y1="10" y2="10" />
              <line x1="6" x2="10" y1="15" y2="15" />
            </svg>
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
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
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