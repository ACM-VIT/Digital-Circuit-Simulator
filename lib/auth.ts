import { currentUser, auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export interface DatabaseUser {
  id: string
  clerk_user_id: string
  email: string
  email_verified: boolean
  first_name: string | null
  last_name: string | null
  username: string | null
  image_url: string | null
  phone_number: string | null
  phone_verified: boolean
  last_sign_in_at: Date | null
  created_at: Date
  updated_at: Date
}

export async function syncUserWithDatabase(): Promise<DatabaseUser | null> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return null
    }

    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      return null
    }

    const {
      id,
      emailAddresses,
      firstName,
      lastName,
      username,
      imageUrl,
      phoneNumbers,
      lastSignInAt
    } = clerkUser

    const primaryEmail = emailAddresses?.[0]?.emailAddress || ''
    const primaryPhone = phoneNumbers?.[0]?.phoneNumber || null

    // Try to find existing user
    const existingUser = await prisma.user.findUnique({
      where: { clerk_user_id: id }
    })

    if (existingUser) {
      // Update existing user
      const updatedUser = await prisma.user.update({
        where: { clerk_user_id: id },
        data: {
          email: primaryEmail,
          email_verified: emailAddresses?.[0]?.verification?.status === 'verified' || false,
          first_name: firstName || '',
          last_name: lastName || '',
          username: username || null,
          image_url: imageUrl || null,
          phone_number: primaryPhone,
          phone_verified: phoneNumbers?.[0]?.verification?.status === 'verified' || false,
          last_sign_in_at: lastSignInAt ? new Date(lastSignInAt) : new Date(),
        }
      })
      
      console.log(`✅ User updated: ${primaryEmail}`)
      return updatedUser
    } else {
      // Create new user
      const newUser = await prisma.user.create({
        data: {
          clerk_user_id: id,
          email: primaryEmail,
          email_verified: emailAddresses?.[0]?.verification?.status === 'verified' || false,
          first_name: firstName || '',
          last_name: lastName || '',
          username: username || null,
          image_url: imageUrl || null,
          phone_number: primaryPhone,
          phone_verified: phoneNumbers?.[0]?.verification?.status === 'verified' || false,
          last_sign_in_at: lastSignInAt ? new Date(lastSignInAt) : new Date(),
        }
      })
      
      console.log(`✅ User created: ${primaryEmail}`)
      return newUser
    }
  } catch (error) {
    console.error('❌ Error syncing user with database:', error)
    return null
  }
}

export async function getCurrentUser(): Promise<DatabaseUser | null> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return null
    }

    let dbUser = await prisma.user.findUnique({
      where: { clerk_user_id: userId }
    })

    if (!dbUser) {
      dbUser = await syncUserWithDatabase()
    }

    return dbUser
  } catch (error) {
    console.error('❌ Error getting current user:', error)
    return null
  }
}

export async function getUserByClerkId(clerkUserId: string): Promise<DatabaseUser | null> {
  try {
    return await prisma.user.findUnique({
      where: { clerk_user_id: clerkUserId }
    })
  } catch (error) {
    console.error('❌ Error getting user by Clerk ID:', error)
    return null
  }
}
