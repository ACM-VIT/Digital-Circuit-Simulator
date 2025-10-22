import { auth } from '@clerk/nextjs/server'
import { getCurrentUser, getUserByClerkId } from '@/lib/auth'
import { DatabaseUser } from '@/lib/auth'

/**
 * Server-side authentication utilities
 * Use these in your API routes and server components
 */

/**
 * Gets the current authenticated user from the database
 * Returns null if not authenticated
 */
export async function getServerUser(): Promise<DatabaseUser | null> {
  const { userId } = await auth()
  
  if (!userId) {
    return null
  }

  return await getCurrentUser()
}

/**
 * Gets user by Clerk user ID from database
 * Useful for API routes where you have the Clerk user ID
 */
export async function getServerUserById(clerkUserId: string): Promise<DatabaseUser | null> {
  return await getUserByClerkId(clerkUserId)
}

/**
 * Checks if user is authenticated and returns user data
 * Throws error if not authenticated
 */
export async function requireAuth(): Promise<DatabaseUser> {
  const user = await getServerUser()
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return user
}

/**
 * Gets the current Clerk user ID
 * Returns null if not authenticated
 */
export async function getClerkUserId(): Promise<string | null> {
  const { userId } = await auth()
  return userId
}
