// app/api/agent/properties/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fetch from 'node-fetch';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || 'BwkyULYyRq_BeZy3i9N6nvLk9IoTDwmL10MfqMWhZKI';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';

async function getRandomHomeImage() {
  try {
    const response = await fetch(
      `https://api.unsplash.com/photos/random?query=house,home,real-estate&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`
    );
    const data = await response.json() as { urls?: { regular: string } };
    return data.urls?.regular || FALLBACK_IMAGE;
  } catch (err) {
    return FALLBACK_IMAGE;
  }
}

// GET /api/agent/properties?agentId=22
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');
  if (!agentId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const properties = await prisma.property.findMany({
      where: { agentId: Number(agentId) },
      include: { agent: true },
    });
    return NextResponse.json(properties);
  } catch (error) {
    console.error('Error fetching agent properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

// POST /api/agent/properties
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const agentId = body.agentId;
    if (!agentId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    // Validate required fields
    const requiredFields = ['title', 'price', 'address', 'bedrooms', 'bathrooms', 'description'];
    const missingFields = requiredFields.filter(field => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    const image = await getRandomHomeImage();
    const property = await prisma.property.create({
      data: {
        ...body,
        agentId: Number(agentId),
        image,
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