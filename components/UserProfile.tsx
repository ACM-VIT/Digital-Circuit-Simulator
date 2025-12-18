'use client'

import { useDatabaseUser } from '@/lib/client-auth'
import { useUser } from '@clerk/nextjs'

export default function UserProfile() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser()
  const { user: dbUser, isLoading, error } = useDatabaseUser()

  if (!clerkLoaded || isLoading) {
    return <div>Loading...</div>
  }

  if (!clerkUser) {
    return <div>Please sign in</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!dbUser) {
    return <div>Syncing user data...</div>
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">User Profile</h2>
      
      <div className="space-y-2">
        <p><strong>Name:</strong> {dbUser.first_name} {dbUser.last_name}</p>
        <p><strong>Email:</strong> {dbUser.email}</p>
        <p><strong>Username:</strong> {dbUser.username || 'Not set'}</p>
        <p><strong>Phone:</strong> {dbUser.phone_number || 'Not set'}</p>
        <p><strong>Email Verified:</strong> {dbUser.email_verified ? 'Yes' : 'No'}</p>
        <p><strong>Last Sign In:</strong> {dbUser.last_sign_in_at ? new Date(dbUser.last_sign_in_at).toLocaleString() : 'Never'}</p>
      </div>
    </div>
  )
}
