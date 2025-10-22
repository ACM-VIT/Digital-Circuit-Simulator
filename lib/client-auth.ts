'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { DatabaseUser } from '@/lib/auth'

/**
 * Client-side authentication utilities
 * Use these in your React components
 */

/**
 * Hook to get the current user from the database
 * Automatically syncs user data when component mounts
 */
export function useDatabaseUser() {
  const { user: clerkUser, isLoaded } = useUser()
  const [dbUser, setDbUser] = useState<DatabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function syncUser() {
      if (!isLoaded) return

      if (!clerkUser) {
        setDbUser(null)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Call API to sync user with database
        const response = await fetch('/api/auth/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to sync user')
        }

        const userData = await response.json()
        setDbUser(userData)
      } catch (err) {
        console.error('Error syncing user:', err)
        setError(err instanceof Error ? err.message : 'Failed to sync user')
      } finally {
        setIsLoading(false)
      }
    }

    syncUser()
  }, [clerkUser, isLoaded])

  return {
    user: dbUser,
    isLoading,
    error,
    isAuthenticated: !!dbUser,
  }
}

/**
 * Hook to get user data without automatic syncing
 * Use this when you just need to check if user exists in database
 */
export function useDatabaseUserQuery() {
  const { user: clerkUser, isLoaded } = useUser()
  const [dbUser, setDbUser] = useState<DatabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUser() {
      if (!isLoaded) return

      if (!clerkUser) {
        setDbUser(null)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch('/api/user/profile')
        
        if (response.status === 404) {
          // User doesn't exist in database yet
          setDbUser(null)
        } else if (!response.ok) {
          throw new Error('Failed to fetch user')
        } else {
          const userData = await response.json()
          setDbUser(userData)
        }
      } catch (err) {
        console.error('Error fetching user:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch user')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [clerkUser, isLoaded])

  return {
    user: dbUser,
    isLoading,
    error,
    isAuthenticated: !!dbUser,
  }
}
