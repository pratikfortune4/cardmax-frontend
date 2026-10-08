'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { apiClient } from '@/lib/api/client'
import type { User } from '@/types'

interface UserContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  refreshUser: () => Promise<void>
  logout: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode
  initialUser?: User | null
}) {
  // If we have an initialUser from server component, we are not loading initially.
  // Otherwise, we load. But wait, layout.tsx only passed NavbarUser, not full User.
  // We'll need to fetch the full user anyway if we want full User object, 
  // or layout.tsx should pass the full user. Let's just fetch it.
  const [user, setUser] = useState<User | null>(initialUser || null)
  const [isLoading, setIsLoading] = useState(!initialUser)
  const [isAuthenticated, setIsAuthenticated] = useState(!!initialUser)

  const refreshUser = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await apiClient.get('/api/users/me')
      if (data && data.user) {
        setUser(data.user)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (e) {
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!initialUser) {
      refreshUser()
    } else {
      setIsLoading(false)
    }
  }, [initialUser, refreshUser])

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/api/users/logout')
    } catch (e) {
      console.error('Logout failed', e)
    }
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  return (
    <UserContext.Provider value={{ user, isAuthenticated, isLoading, refreshUser, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
