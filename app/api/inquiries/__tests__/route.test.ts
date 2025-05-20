// app/api/inquiries/__tests__/route.test.ts

// stub out next/server before any imports, same as your other API-route tests:
jest.mock('next/server', () => {
  class FakeResponse {
    status: number
    private _body: any
    constructor(body: any, init?: { status?: number }) {
      this._body = body
      this.status = init?.status ?? 200
    }
    async json() { return this._body }
    static json(b: any, init?: { status?: number }) { return new FakeResponse(b, init) }
  }
  class FakeRequest {
    url: string
    method: string
    private _body?: string
    constructor(input: string|{url:string}, init:any={}) {
      this.url = typeof input === 'string' ? input : input.url
      this.method = init.method || 'GET'
      this._body = init.body
    }
    async json() { return JSON.parse(this._body||'{}') }
  }
  return {
    NextRequest: FakeRequest,
    NextResponse: FakeResponse,
    Headers: class { constructor(init?:any){} },
  }
})

// now mock the exact module your code imports:
jest.mock('@/lib/mockAuthUtils', () => ({
  isLoggedIn: jest.fn(),
  getAgentId: jest.fn(),
}))

// mock Prisma as before
jest.mock('@/lib/prisma', () => ({
  prisma: { inquiry: { /*…*/ }, property: { /*…*/ } }
}))

// finally, your imports
import { NextRequest } from 'next/server'
import { POST, GET } from '../route'
import { prisma } from '@/lib/prisma'
import { getAgentId, isLoggedIn } from '@/lib/mockAuthUtils'

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    inquiry: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    property: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock authentication
jest.mock('@/lib/mockAuth', () => ({
  isLoggedIn: jest.fn(() => true),
  getAgentId: jest.fn(() => '1'),
}));

describe('Inquiries API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (isLoggedIn as jest.Mock).mockReturnValue(true);
    (getAgentId as jest.Mock).mockReturnValue(1);
  })

  describe('POST /api/inquiries', () => {
    const mockInquiry = {
      propertyId: 1,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      message: 'I am interested in this property',
    };

    it('creates a new inquiry for a property', async () => {
      const createdInquiry = {
        id: 1,
        ...mockInquiry,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.property.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.inquiry.create as jest.Mock).mockResolvedValue(createdInquiry);

      const request = new NextRequest('http://localhost:3000/api/inquiries', {
        method: 'POST',
        body: JSON.stringify(mockInquiry),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(createdInquiry);
      expect(prisma.inquiry.create).toHaveBeenCalledWith({
        data: mockInquiry,
      });
    });

    it('validates required fields', async () => {
      const invalidInquiry = {
        propertyId: 1,
        name: 'John Doe',
        // Missing email and message
      };

      const request = new NextRequest('http://localhost:3000/api/inquiries', {
        method: 'POST',
        body: JSON.stringify(invalidInquiry),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });

    it('returns 404 if property does not exist', async () => {
      (prisma.property.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/inquiries', {
        method: 'POST',
        body: JSON.stringify(mockInquiry),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Property not found' });
    });
  });

  describe('GET /api/inquiries', () => {
    it('returns inquiries for properties owned by the agent', async () => {
      const mockInquiries = [
        {
          id: 1,
          propertyId: 1,
          name: 'John Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
          message: 'I am interested in this property',
          createdAt: new Date(),
          updatedAt: new Date(),
          property: {
            id: 1,
            agentId: 1,
          },
        },
      ];

      (prisma.inquiry.findMany as jest.Mock).mockResolvedValue(mockInquiries);

      const request = new NextRequest('http://localhost:3000/api/inquiries');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockInquiries);
      expect(prisma.inquiry.findMany).toHaveBeenCalledWith({
        where: {
          property: {
            agentId: 1,
          },
        },
        include: {
          property: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('returns 401 if not authenticated', async () => {
      (isLoggedIn as jest.Mock).mockReturnValue(false);

      const request = new NextRequest('http://localhost:3000/api/inquiries');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('filters inquiries by property ID when provided', async () => {
      const mockInquiries = [
        {
          id: 1,
          propertyId: 1,
          name: 'John Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
          message: 'I am interested in this property',
          createdAt: new Date(),
          updatedAt: new Date(),
          property: {
            id: 1,
            agentId: 1,
          },
        },
      ];

      (prisma.inquiry.findMany as jest.Mock).mockResolvedValue(mockInquiries);

      const request = new NextRequest('http://localhost:3000/api/inquiries?propertyId=1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockInquiries);
      expect(prisma.inquiry.findMany).toHaveBeenCalledWith({
        where: {
          propertyId: 1,
          property: {
            agentId: 1,
          },
        },
        include: {
          property: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });
}); 