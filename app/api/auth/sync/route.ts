import { NextRequest, NextResponse } from 'next/server'
import { syncUserWithDatabase } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await syncUserWithDatabase()
    
    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        clerk_user_id: user.clerk_user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        image_url: user.image_url
      }
    })
  } catch (error) {
    console.error('Error syncing user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
