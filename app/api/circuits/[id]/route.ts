import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const circuit = await prisma.circuit.findFirst({
      where: {
        id: params.id,
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
      }
    })

    if (!circuit) {
      return NextResponse.json({ error: 'Circuit not found' }, { status: 404 })
    }

    return NextResponse.json(circuit)
  } catch (error) {
    console.error('Error fetching circuit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, circuit_data, is_public, category_ids = [], label_ids = [] } = body

    // Check if circuit exists and belongs to user
    const existingCircuit = await prisma.circuit.findFirst({
      where: {
        id: params.id,
        clerk_user_id: user.clerk_user_id
      }
    })

    if (!existingCircuit) {
      return NextResponse.json({ error: 'Circuit not found' }, { status: 404 })
    }

    // Update circuit with transaction to handle categories and labels
    const circuit = await prisma.$transaction(async (tx: any) => {
      // Update circuit
      const updatedCircuit = await tx.circuit.update({
        where: { id: params.id },
        data: {
          name,
          description,
          circuit_data,
          is_public
        }
      })

      // Update categories
      await tx.circuitCategory.deleteMany({
        where: { circuit_id: params.id }
      })

      if (category_ids.length > 0) {
        await tx.circuitCategory.createMany({
          data: category_ids.map((category_id: string) => ({
            circuit_id: params.id,
            category_id
          }))
        })
      }

      // Update labels
      await tx.circuitLabel.deleteMany({
        where: { circuit_id: params.id }
      })

      if (label_ids.length > 0) {
        await tx.circuitLabel.createMany({
          data: label_ids.map((label_id: string) => ({
            circuit_id: params.id,
            label_id
          }))
        })
      }

      return updatedCircuit
    })

    return NextResponse.json(circuit)
  } catch (error) {
    console.error('Error updating circuit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { category_ids, label_ids } = body

    // Check if circuit exists and belongs to user
    const existingCircuit = await prisma.circuit.findFirst({
      where: {
        id: params.id,
        clerk_user_id: user.clerk_user_id
      }
    })

    if (!existingCircuit) {
      return NextResponse.json({ error: 'Circuit not found' }, { status: 404 })
    }

    // Update only categories and/or labels
    await prisma.$transaction(async (tx: any) => {
      if (category_ids !== undefined) {
        // Update categories
        await tx.circuitCategory.deleteMany({
          where: { circuit_id: params.id }
        })

        if (category_ids.length > 0) {
          await tx.circuitCategory.createMany({
            data: category_ids.map((category_id: string) => ({
              circuit_id: params.id,
              category_id
            }))
          })
        }
      }

      if (label_ids !== undefined) {
        // Update labels
        await tx.circuitLabel.deleteMany({
          where: { circuit_id: params.id }
        })

        if (label_ids.length > 0) {
          await tx.circuitLabel.createMany({
            data: label_ids.map((label_id: string) => ({
              circuit_id: params.id,
              label_id
            }))
          })
        }
      }
    })

    // Fetch and return updated circuit
    const updatedCircuit = await prisma.circuit.findUnique({
      where: { id: params.id },
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

    return NextResponse.json(updatedCircuit)
  } catch (error) {
    console.error('Error patching circuit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if circuit exists and belongs to user
    const existingCircuit = await prisma.circuit.findFirst({
      where: {
        id: params.id,
        clerk_user_id: user.clerk_user_id
      }
    })

    if (!existingCircuit) {
      return NextResponse.json({ error: 'Circuit not found' }, { status: 404 })
    }

    await prisma.circuit.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Circuit deleted successfully' })
  } catch (error) {
    console.error('Error deleting circuit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
