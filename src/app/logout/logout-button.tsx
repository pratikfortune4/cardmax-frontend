'use client'
import { IconAlertCircle, IconLogOut } from '@/components/Icons';


import { useState } from 'react'
import Link from 'next/link'
import { API_BASE_URL } from '@/lib/api'

export const LogoutButton = () => {
  const [loggingOut, setLoggingOut] = useState(false)
  const [error, setError] = useState('')

  const handleLogout = async () => {
    setLoggingOut(true)
    setError('')

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/logout`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) {
        setError('Could not log out. Please try again.')
        setLoggingOut(false)
        return
      }
      window.location.href = '/'
    } catch {
      setError('Network error. Please try again.')
      setLoggingOut(false)
    }
  }

  return (
    <div className="cm-logout-actions">
      {error && (
        <div className="cm-logout-alert" role="alert">
          <IconAlertCircle width="18" height="18" />
          <span>{error}</span>
        </div>
      )}
      <button
        type="button"
        className="cm-logout-btn-submit"
        onClick={handleLogout}
        disabled={loggingOut}
      >
        {loggingOut ? (
          <>
            <span className="cm-logout-spinner" />
            <span>Logging out…</span>
          </>
        ) : (
          <>
            <IconLogOut width="18" height="18" />
            <span>Log out</span>
          </>
        )}
      </button>
      <Link href="/" className="cm-logout-btn-cancel">
        Cancel
      </Link>
    </div>
  )
}