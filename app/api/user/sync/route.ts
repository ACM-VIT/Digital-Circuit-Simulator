import { NextRequest, NextResponse } from 'next/server'
import { syncUserWithDatabase } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await syncUserWithDatabase()
    
    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error syncing user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
