import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isLoggedIn, getAgentId } from '@/lib/mockAuthUtils';

// POST /api/inquiries
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['propertyId', 'name', 'email', 'message'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: body.propertyId },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        propertyId: body.propertyId,
        name: body.name,
        email: body.email,
        phone: body.phone,
        message: body.message,
      },
    });

    return NextResponse.json(inquiry, { status: 201 });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return NextResponse.json(
      { error: 'Failed to create inquiry' },
      { status: 500 }
    );
  }
}

// GET /api/inquiries
export async function GET(request: NextRequest) {
  if (!isLoggedIn()) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const agentId = getAgentId();
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    const where: any = {
      ...(propertyId ? { propertyId: parseInt(propertyId) } : {}),
      ...(agentId !== null ? { property: { agentId } } : {}),
    };

    const inquiries = await prisma.inquiry.findMany({
      where,
      include: {
        property: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(inquiries);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
} 