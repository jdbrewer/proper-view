import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/properties/[id]/view
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { params } = context;
  const { id } = await params;
  const propertyId = Number(id);
  if (!propertyId) {
    return NextResponse.json({ error: 'Missing property id' }, { status: 400 });
  }
  try {
    const property = await prisma.property.update({
      where: { id: propertyId },
      data: { views: { increment: 1 } },
      select: { views: true },
    });
    return NextResponse.json({ views: property.views });
  } catch (error) {
    console.error('Error incrementing property views:', error);
    return NextResponse.json({ error: 'Failed to increment views' }, { status: 500 });
  }
} 