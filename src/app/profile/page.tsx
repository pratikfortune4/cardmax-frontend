import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { API_BASE_URL, getAuthHeaders } from '@/lib/api'
import { ProfileView, UserProfileData } from './profile-view'

export const metadata = {
  title: 'My Profile — CardMax',
  description: 'View and manage your CardMax user profile, personal and financial details, and connected services.',
}

export default async function ProfilePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value

  if (!token) {
    redirect('/login')
  }

  let profileData: UserProfileData | null = null
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
      headers: getAuthHeaders(token),
      cache: 'no-store',
    })

    if (!res.ok) {
      redirect('/login')
    }

    profileData = await res.json()
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
    redirect('/login')
  }

  if (!profileData) {
    redirect('/login')
  }

  return <ProfileView initialUser={profileData} />
}
