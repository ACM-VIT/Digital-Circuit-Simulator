import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const circuits = await prisma.circuit.findMany({
      where: {
        clerk_user_id: user.clerk_user_id
      },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        labels: {
          include: {
            label: true
          }
        }
      },
      orderBy: {
        updated_at: 'desc'
      }
    })

    return NextResponse.json(circuits)
  } catch (error) {
    console.error('Error fetching circuits:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, circuit_data, is_public = false, category_ids = [], label_ids = [] } = body

    if (!name || !circuit_data) {
      return NextResponse.json({ error: 'Name and circuit_data are required' }, { status: 400 })
    }

    // Create the circuit
    const circuit = await prisma.circuit.create({
      data: {
        clerk_user_id: user.clerk_user_id,
        name,
        description,
        circuit_data,
        is_public,
        categories: {
          create: category_ids.map((category_id: string) => ({
            category_id
          }))
        },
        labels: {
          create: label_ids.map((label_id: string) => ({
            label_id
          }))
        }
      },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        labels: {
          include: {
            label: true
          }
        }
      }
    })

    return NextResponse.json(circuit, { status: 201 })
  } catch (error) {
    console.error('Error creating circuit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
