import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { API_BASE_URL } from '@/lib/api'
import { isProfileComplete } from '@/lib/guard'
import { CompleteProfileForm } from './complete-profile-form'

export default async function CompleteProfilePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value

  if (!token) {
    redirect('/login')
  }

  let user = null
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/me`, {
      headers: { cookie: `payload-token=${token}` },
      cache: 'no-store',
    })
    if (res.ok) {
      const data = await res.json()
      user = data.user
    }
  } catch {
    // ignore
  }

  if (!user) {
    redirect('/login')
  }

  if (isProfileComplete(user)) {
    redirect('/')
  }

  return (
    <main className="auth-page">
      <CompleteProfileForm user={user} />
    </main>
  )
}