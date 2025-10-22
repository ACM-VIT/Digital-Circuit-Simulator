'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect } from 'react'

export default function UserSync() {
  const { user, isLoaded } = useUser()

  useEffect(() => {
    async function syncUser() {
      if (!isLoaded || !user) return

      try {
        // Call the sync API to ensure user is in database
        const response = await fetch('/api/auth/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          console.log('✅ User synced with database')
        } else {
          console.error('❌ Failed to sync user with database')
        }
      } catch (error) {
        console.error('❌ Error syncing user:', error)
      }
    }

    syncUser()
  }, [user, isLoaded])

  // This component doesn't render anything, it just handles syncing
  return null
}
