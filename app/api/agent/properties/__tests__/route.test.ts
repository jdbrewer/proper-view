// Route handlers import `fetch` from 'node-fetch', so we must mock it
jest.mock("node-fetch", () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue({
    // this shape will satisfy getRandomHomeImage()
    json: async () => ({
      urls: { regular: "https://example.com/fallback.jpg" },
    }),
  }),
}));

// fully stub both Request & Response for Next
jest.mock("next/server", () => {
  // A minimal fake NextResponse that can be constructed *and* has static .json()
  class FakeResponse {
    status: number;
    private _body: any;
    constructor(body: any, init?: { status?: number }) {
      this._body = body;
      this.status = init?.status ?? 200;
    }
    async json() {
      return this._body;
    }
    static json(body: any, init?: { status?: number }) {
      return new FakeResponse(body, init);
    }
  }

  // A minimal fake NextRequest
  class FakeRequest {
    url: string;
    method: string;
    private _body?: string;
    constructor(input: string | { url: string }, init: any = {}) {
      this.url = typeof input === "string" ? input : input.url;
      this.method = init.method || "GET";
      this._body = init.body;
    }
    async json() {
      return JSON.parse(this._body || "{}");
    }
  }

  return {
    NextRequest: FakeRequest,
    NextResponse: FakeResponse,
    Headers: class {
      constructor(init?: any) {}
    },
  };
});

// Mock Prisma client
jest.mock("@/lib/prisma", () => ({
  prisma: {
    property: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

// Mock authentication
jest.mock("@/lib/mockAuthUtils", () => ({
  isLoggedIn: jest.fn(),
  getAgentId: jest.fn(),
}));

import { NextRequest } from "next/server";
import { GET, POST } from "../route";
import { prisma } from "@/lib/prisma";
import { getAgentId, isLoggedIn } from "@/lib/mockAuthUtils";
import { DELETE, PATCH } from "../[id]/route";

describe("Agent Properties API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (isLoggedIn as jest.Mock).mockReturnValue(true);
    (getAgentId as jest.Mock).mockReturnValue(1);
  });

  describe("GET /api/agent/properties", () => {
    it("returns only properties for the authenticated agent", async () => {
      const mockProperties = [
        {
          id: 1,
          title: "Test Property",
          price: 500000,
          address: "123 Test St",
          bedrooms: 3,
          bathrooms: 2,
          description: "Test description",
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
          agentId: 1,
        },
      ];

      (prisma.property.findMany as jest.Mock).mockResolvedValue(mockProperties);

      const request = new NextRequest(
        "http://localhost:3000/api/agent/properties?agentId=1"
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockProperties);
      expect(prisma.property.findMany).toHaveBeenCalledWith({
        where: { agentId: 1 },
        include: { agent: true },
      });
    });

    it("returns 401 if not authenticated", async () => {
      (isLoggedIn as jest.Mock).mockReturnValue(false);

      // Remove agentId from the body to simulate no authentication
      const mockPropertyWithoutAgent = {
        title: "New Property",
        price: 600000,
        address: "456 New St",
        bedrooms: 4,
        bathrooms: 3,
        description: "New property description",
        status: "active",
        // No agentId here
      };

      const request = new NextRequest(
        "http://localhost:3000/api/agent/properties",
        {
          method: "POST",
          body: JSON.stringify(mockPropertyWithoutAgent),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: "Unauthorized" });
    });

    it("handles errors gracefully", async () => {
      (prisma.property.findMany as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const request = new NextRequest(
        "http://localhost:3000/api/agent/properties?agentId=1"
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: "Failed to fetch properties" });
    });
  });

  describe("POST /api/agent/properties", () => {
    const mockProperty = {
      title: "New Property",
      price: 600000,
      address: "456 New St",
      bedrooms: 4,
      bathrooms: 3,
      description: "New property description",
      status: "active",
      agentId: 1,
    };

    it("creates a new property for the authenticated agent", async () => {
      const createdProperty = {
        id: 1,
        ...mockProperty,
        agentId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.property.create as jest.Mock).mockResolvedValue(createdProperty);

      const request = new NextRequest(
        "http://localhost:3000/api/agent/properties",
        {
          method: "POST",
          body: JSON.stringify(mockProperty),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(createdProperty);
      expect(prisma.property.create).toHaveBeenCalledWith({
        data: {
          ...mockProperty,
          agentId: 1,
          image: "https://example.com/fallback.jpg", // matches node‐fetch mock
        },
      });
    });

    it("returns 401 if not authenticated", async () => {
      (isLoggedIn as jest.Mock).mockReturnValue(false);

      // Remove agentId from the body to simulate no authentication
      const mockPropertyWithoutAgent = {
        title: "New Property",
        price: 600000,
        address: "456 New St",
        bedrooms: 4,
        bathrooms: 3,
        description: "New property description",
        status: "active",
        // No agentId here
      };

      const request = new NextRequest(
        "http://localhost:3000/api/agent/properties",
        {
          method: "POST",
          body: JSON.stringify(mockPropertyWithoutAgent),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: "Unauthorized" });
    });

    it("validates required fields", async () => {
      const invalidProperty = {
        title: "Invalid Property",
        agentId: 1, // Add this so it passes auth check
        // Missing other required fields like price, address, etc.
      };

      const request = new NextRequest(
        "http://localhost:3000/api/agent/properties",
        {
          method: "POST",
          body: JSON.stringify(invalidProperty),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("error");
    });
  });

  describe("PATCH /api/agent/properties/[id]", () => {
    const mockUpdate = {
      price: 550000,
      description: "Updated description",
    };

    it("updates an existing property owned by the agent", async () => {
      const existingProperty = {
        id: 1,
        title: "Test Property",
        price: 500000,
        address: "123 Test St",
        bedrooms: 3,
        bathrooms: 2,
        description: "Test description",
        status: "active",
        agentId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.property.findUnique as jest.Mock).mockResolvedValue(
        existingProperty
      );
      (prisma.property.update as jest.Mock).mockResolvedValue({
        ...existingProperty,
        ...mockUpdate,
      });

      const request = new NextRequest(
        "http://localhost:3000/api/agent/properties/1",
        {
          method: "PATCH",
          body: JSON.stringify(mockUpdate),
        }
      );

      const response = await PATCH(request, { params: { id: "1" } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        ...existingProperty,
        ...mockUpdate,
      });
      expect(prisma.property.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: mockUpdate,
      });
    });

    it("returns 401 if not authenticated", async () => {
      (isLoggedIn as jest.Mock).mockReturnValue(false);

      const request = new NextRequest(
        "http://localhost:3000/api/agent/properties/1",
        {
          method: "PATCH",
          body: JSON.stringify(mockUpdate),
        }
      );

      const response = await PATCH(request, { params: { id: "1" } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: "Unauthorized" });
    });

    it("returns 404 if property does not exist", async () => {
      (prisma.property.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/agent/properties/999",
        {
          method: "PATCH",
          body: JSON.stringify(mockUpdate),
        }
      );

      const response = await PATCH(request, { params: { id: "999" } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: "Property not found" });
    });

    it("returns 403 if property belongs to another agent", async () => {
      (prisma.property.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        agentId: 2, // Different agent
      });

      const request = new NextRequest(
        "http://localhost:3000/api/agent/properties/1",
        {
          method: "PATCH",
          body: JSON.stringify(mockUpdate),
        }
      );

      const response = await PATCH(request, { params: { id: "1" } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data).toEqual({ error: "Forbidden" });
    });
  });

  describe("DELETE /api/agent/properties/[id]", () => {
    it("deletes an existing property owned by the agent", async () => {
      const existingProperty = {
        id: 1,
        agentId: 1,
      };

      (prisma.property.findUnique as jest.Mock).mockResolvedValue(
        existingProperty
      );
      (prisma.property.delete as jest.Mock).mockResolvedValue(existingProperty);

      const request = new NextRequest(
        "http://localhost:3000/api/agent/properties/1",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request, { params: { id: "1" } });
      expect(response.status).toBe(204);
      expect(prisma.property.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("returns 401 if not authenticated", async () => {
      (isLoggedIn as jest.Mock).mockReturnValue(false);

      const request = new NextRequest(
        "http://localhost:3000/api/agent/properties/1",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request, { params: { id: "1" } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: "Unauthorized" });
    });

    it("returns 404 if property does not exist", async () => {
      (prisma.property.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/agent/properties/999",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request, { params: { id: "999" } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: "Property not found" });
    });

    it("returns 403 if property belongs to another agent", async () => {
      (prisma.property.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        agentId: 2, // Different agent
      });

      const request = new NextRequest(
        "http://localhost:3000/api/agent/properties/1",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request, { params: { id: "1" } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data).toEqual({ error: "Forbidden" });
    });
  });
});
