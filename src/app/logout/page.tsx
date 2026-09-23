import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { API_BASE_URL } from '@/lib/api'
import { LogoutButton } from './logout-button'

export default async function LogoutPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value

  if (!token) {
    redirect('/login')
  }

  let userEmail = 'User'
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/me`, {
      headers: {
        cookie: `payload-token=${token}`,
      },
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

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <h1>Log out</h1>
          <p>You are signed in as {userEmail}. Are you sure you want to log out?</p>
        </div>
        <LogoutButton />
      </div>
    </main>
  )
}