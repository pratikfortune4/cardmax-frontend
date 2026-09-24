'use client'

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
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
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
            <svg
              width="18"
              height="18"
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