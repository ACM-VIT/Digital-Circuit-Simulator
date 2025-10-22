import { prisma } from './prisma'
import { currentUser } from '@clerk/nextjs/server'

export async function ensureUserSync() {
  try {
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      return null
    }

    // Check if user exists in our database
    const existingUser = await prisma.user.findUnique({
      where: { clerk_user_id: clerkUser.id }
    })

    if (existingUser) {
      // Update existing user with latest Clerk data
      const updatedUser = await prisma.user.update({
        where: { clerk_user_id: clerkUser.id },
        data: {
          email: clerkUser.emailAddresses[0]?.emailAddress || existingUser.email,
          email_verified: clerkUser.emailAddresses[0]?.verification?.status === 'verified' || false,
          first_name: clerkUser.firstName || existingUser.first_name,
          last_name: clerkUser.lastName || existingUser.last_name,
          username: clerkUser.username || existingUser.username,
          image_url: clerkUser.imageUrl || existingUser.image_url,
          phone_number: clerkUser.phoneNumbers[0]?.phoneNumber || existingUser.phone_number,
          phone_verified: clerkUser.phoneNumbers[0]?.verification?.status === 'verified' || false,
          last_sign_in_at: new Date(),
        },
      })
      
      console.log(`✅ User synced: ${updatedUser.email}`)
      return updatedUser
    } else {
      // Create new user
      const newUser = await prisma.user.create({
        data: {
          clerk_user_id: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          email_verified: clerkUser.emailAddresses[0]?.verification?.status === 'verified' || false,
          first_name: clerkUser.firstName || '',
          last_name: clerkUser.lastName || '',
          username: clerkUser.username || null,
          image_url: clerkUser.imageUrl || null,
          phone_number: clerkUser.phoneNumbers[0]?.phoneNumber || null,
          phone_verified: clerkUser.phoneNumbers[0]?.verification?.status === 'verified' || false,
          last_sign_in_at: new Date(),
        },
      })
      
      console.log(`✅ New user created: ${newUser.email}`)
      return newUser
    }
  } catch (error) {
    console.error('❌ Error syncing user:', error)
    return null
  }
}

export async function getUserFromDatabase(clerkUserId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerk_user_id: clerkUserId },
      include: {
        circuits: {
          orderBy: { updated_at: 'desc' },
          take: 5
        },
        categories: {
          orderBy: { created_at: 'desc' },
          take: 5
        },
        labels: {
          orderBy: { created_at: 'desc' },
          take: 5
        }
      }
    })
    
    return user
  } catch (error) {
    console.error('❌ Error fetching user from database:', error)
    return null
  }
}
