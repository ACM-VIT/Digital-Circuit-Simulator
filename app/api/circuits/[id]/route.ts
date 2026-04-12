import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getServerUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const circuit = await prisma.circuit.findFirst({
      where: {
        id,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getServerUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, circuit_data, is_public, category_ids = [], label_ids = [] } = body

    // Check if circuit exists and belongs to user
    const existingCircuit = await prisma.circuit.findFirst({
      where: {
        id,
        clerk_user_id: user.clerk_user_id
      }
    })

    if (!existingCircuit) {
      return NextResponse.json({ error: 'Circuit not found' }, { status: 404 })
    }

    // Update circuit with transaction to handle categories and labels
    const circuit = await prisma.$transaction(async (tx: any) => {
      // Update circuit
      const updateData: any = {
        name,
        description,
        circuit_data,
        is_public,
      }

      const updatedCircuit = await tx.circuit.update({
        where: { id },
        data: updateData
      })

      // Only update categories if provided
      if (body.category_ids !== undefined) {
        await tx.circuitCategory.deleteMany({
          where: { circuit_id: id }
        })

        if (body.category_ids.length > 0) {
          await tx.circuitCategory.createMany({
            data: body.category_ids.map((category_id: string) => ({
              circuit_id: id,
              category_id
            }))
          })
        }
      }

      // Only update labels if provided
      if (body.label_ids !== undefined) {
        await tx.circuitLabel.deleteMany({
          where: { circuit_id: id }
        })

        if (body.label_ids.length > 0) {
          await tx.circuitLabel.createMany({
            data: body.label_ids.map((label_id: string) => ({
              circuit_id: id,
              label_id
            }))
          })
        }
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getServerUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { category_ids, label_ids, name, description } = body

    // Check if circuit exists and belongs to user
    const existingCircuit = await prisma.circuit.findFirst({
      where: {
        id,
        clerk_user_id: user.clerk_user_id
      }
    })

    if (!existingCircuit) {
      return NextResponse.json({ error: 'Circuit not found' }, { status: 404 })
    }

    // Update circuit fields, categories and/or labels
    await prisma.$transaction(async (tx: any) => {
      // Update name and/or description if provided
      if (name !== undefined || description !== undefined) {
        const updateData: any = {}
        if (name !== undefined) updateData.name = name
        if (description !== undefined) updateData.description = description

        await tx.circuit.update({
          where: { id },
          data: updateData
        })
      }

      if (category_ids !== undefined) {
        // Update categories
        await tx.circuitCategory.deleteMany({
          where: { circuit_id: id }
        })

        if (category_ids.length > 0) {
          await tx.circuitCategory.createMany({
            data: category_ids.map((category_id: string) => ({
              circuit_id: id,
              category_id
            }))
          })
        }
      }

      if (label_ids !== undefined) {
        // Update labels
        await tx.circuitLabel.deleteMany({
          where: { circuit_id: id }
        })

        if (label_ids.length > 0) {
          await tx.circuitLabel.createMany({
            data: label_ids.map((label_id: string) => ({
              circuit_id: id,
              label_id
            }))
          })
        }
      }
    })

    // Fetch and return updated circuit
    const updatedCircuit = await prisma.circuit.findUnique({
      where: { id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getServerUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if circuit exists and belongs to user
    const existingCircuit = await prisma.circuit.findFirst({
      where: {
        id,
        clerk_user_id: user.clerk_user_id
      }
    })

    if (!existingCircuit) {
      return NextResponse.json({ error: 'Circuit not found' }, { status: 404 })
    }

    await prisma.circuit.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Circuit deleted successfully' })
  } catch (error) {
    console.error('Error deleting circuit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
