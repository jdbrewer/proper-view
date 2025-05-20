import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/properties
export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      include: {
        agent: true,
      },
    });
    return NextResponse.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

// POST /api/properties
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Remove agentId from required fields, but require it separately
    const requiredFields = ['title', 'price', 'address', 'bedrooms', 'bathrooms', 'description'];
    const missingFields = requiredFields.filter(field => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    if (!body.agentId) {
      return NextResponse.json(
        { error: 'Missing agentId' },
        { status: 400 }
      );
    }
    const property = await prisma.property.create({
      data: {
        ...body,
        agentId: Number(body.agentId),
      },
    });
    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
}

// PATCH /api/properties/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const propertyId = parseInt(id);
    const body = await request.json();
    const property = await prisma.property.update({
      where: { id: propertyId },
      data: body,
    });
    return NextResponse.json(property);
  } catch (error) {
    console.error('Error updating property:', error);
    if (error instanceof Error && error.message.includes('Record not found')) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    );
  }
}

// DELETE /api/properties/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const propertyId = parseInt(id);
    await prisma.property.delete({
      where: { id: propertyId },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting property:', error);
    if (error instanceof Error && error.message.includes('Record not found')) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    );
  }
}