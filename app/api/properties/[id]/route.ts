import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  context: any
) {
  const params = await context.params;
  try {
    const property = await prisma.property.findUnique({
      where: { id: Number(params.id) },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(property);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch property' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: any
) {
  const params = await context.params;
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    const property = await prisma.property.update({
      where: { id },
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

export async function DELETE(
  request: NextRequest,
  context: any
) {
  const params = await context.params;
  try {
    const id = parseInt(params.id);
    await prisma.property.delete({
      where: { id },
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