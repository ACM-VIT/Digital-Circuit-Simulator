import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userWithRelations = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        circuits: {
          select: {
            id: true,
            name: true,
            updated_at: true
          },
          orderBy: { updated_at: 'desc' },
          take: 3
        },
        categories: {
          select: {
            id: true
          }
        },
        labels: {
          select: {
            id: true
          }
        }
      }
    })

    if (!userWithRelations) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: userWithRelations.id,
      clerk_user_id: userWithRelations.clerk_user_id,
      email: userWithRelations.email,
      email_verified: userWithRelations.email_verified,
      first_name: userWithRelations.first_name,
      last_name: userWithRelations.last_name,
      username: userWithRelations.username,
      image_url: userWithRelations.image_url,
      phone_number: userWithRelations.phone_number,
      phone_verified: userWithRelations.phone_verified,
      last_sign_in_at: userWithRelations.last_sign_in_at,
      created_at: userWithRelations.created_at,
      updated_at: userWithRelations.updated_at,
      stats: {
        total_circuits: userWithRelations.circuits.length,
        total_categories: userWithRelations.categories.length,
        total_labels: userWithRelations.labels.length,
        recent_circuits: userWithRelations.circuits
      }
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getServerUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { first_name, last_name, username } = body

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        first_name: first_name || undefined,
        last_name: last_name || undefined,
        username: username || undefined,
      },
    })

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        username: updatedUser.username,
        email: updatedUser.email,
        image_url: updatedUser.image_url,
        updated_at: updatedUser.updated_at
      }
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
