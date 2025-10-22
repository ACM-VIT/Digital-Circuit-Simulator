import { auth } from '@clerk/nextjs/server'
import { getCurrentUser, getUserByClerkId } from '@/lib/auth'
import { DatabaseUser } from '@/lib/auth'

export async function getServerUser(): Promise<DatabaseUser | null> {
  const { userId } = await auth()
  
  if (!userId) {
    return null
  }

  return await getCurrentUser()
}

export async function getServerUserById(clerkUserId: string): Promise<DatabaseUser | null> {
  return await getUserByClerkId(clerkUserId)
}

export async function requireAuth(): Promise<DatabaseUser> {
  const user = await getServerUser()
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return user
}

export async function getClerkUserId(): Promise<string | null> {
  const { userId } = await auth()
  return userId
}
