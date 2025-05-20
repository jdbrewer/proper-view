import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isLoggedIn, getAgentId } from '@/lib/mockAuthUtils';

// PATCH /api/agent/properties/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isLoggedIn()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const agentId = getAgentId()
  if (!agentId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const propertyId = Number(id)
  try {
    const existingProperty = await prisma.property.findUnique({
      where: { id: propertyId },
    })
    if (!existingProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }
    if (existingProperty.agentId !== agentId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const updates = await request.json()
    const updatedProperty = await prisma.property.update({
      where: { id: propertyId },
      data: updates,
    })
    return NextResponse.json(updatedProperty)
  } catch (err) {
    console.error('Error updating property:', err)
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    )
  }
}

// DELETE /api/agent/properties/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isLoggedIn()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const propertyId = Number(id)
  const agentId = getAgentId()
  if (!agentId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const existingProperty = await prisma.property.findUnique({
      where: { id: propertyId },
    })
    if (!existingProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }
    if (existingProperty.agentId !== agentId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    await prisma.property.delete({ where: { id: propertyId } })
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error('Error deleting property:', err)
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    )
  }
}