import React from 'react'
import { cookies } from 'next/headers'
import { API_BASE_URL } from '@/lib/api'
import {
  DashboardView,
  LandingView,
} from '@/components/Dashboard'
import './home.scss'

export const metadata = {
  title: 'Dashboard — CardMax',
  description: 'Consolidated credit card wallet, reward optimization, and statement intelligence.',
}

export default async function HomePage() {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()

  if (!cookieStore.has('payload-token')) {
    return <LandingView />
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/users/dashboard`, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      return <LandingView />
    }

    const data = await res.json()

    if (!data?.authenticated || !data?.dashboard) {
      return <LandingView />
    }

    return <DashboardView data={data.dashboard} />
  } catch (err) {
    console.error('Failed to fetch dashboard data:', err)
    return <LandingView />
  }
}
