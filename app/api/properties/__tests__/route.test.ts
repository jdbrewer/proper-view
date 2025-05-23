// ─────────────────────────────────────────────────────────────────────────────
// 1) Stub out next/server so that NextRequest/NextResponse
//    are simple stand-ins and don't pull in real Web APIs
// ─────────────────────────────────────────────────────────────────────────────
jest.mock("next/server", () => {
  // Fake NextResponse both as a constructor and with a .json() static helper:
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
    static json(b: any, init?: { status?: number }) {
      return new FakeResponse(b, init);
    }
  }

  // Fake NextRequest that lets you pass a URL and optional body
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

// Mock Next.js cookies for authentication
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    get: jest.fn((name: string) => {
      // Mock the agent being logged in
      if (name === "agentName") {
        return { value: "Test Agent" };
      }
      if (name === "agentId") {
        return { value: "1" };
      }
      return undefined;
    }),
  })),
}));

import { NextRequest } from "next/server";
import { GET, POST, PATCH, DELETE } from "../route";
import { prisma } from "@/lib/prisma";

describe("Properties API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/properties", () => {
    it("returns all properties", async () => {
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

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockProperties);
      expect(prisma.property.findMany).toHaveBeenCalledWith({
        include: { agent: true },
      });
    });

    it("handles errors gracefully", async () => {
      (prisma.property.findMany as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: "Failed to fetch properties" });
    });
  });

  describe("POST /api/properties", () => {
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

    it("creates a new property", async () => {
      const createdProperty = {
        id: 1,
        ...mockProperty,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (prisma.property.create as jest.Mock).mockResolvedValue(createdProperty);

      const request = new NextRequest("http://localhost:3000/api/properties", {
        method: "POST",
        body: JSON.stringify(mockProperty),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(createdProperty);
      expect(prisma.property.create).toHaveBeenCalledWith({
        data: mockProperty,
      });
    });

    it("validates required fields", async () => {
      const invalidProperty = { title: "Invalid Property" }; // Missing required fields

      const request = new NextRequest("http://localhost:3000/api/properties", {
        method: "POST",
        body: JSON.stringify(invalidProperty),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("error");
    });
  });

  describe("PATCH /api/properties/[id]", () => {
    const mockUpdate = {
      price: 550000,
      description: "Updated description",
    };

    it("updates an existing property", async () => {
      const updatedProperty = {
        id: 1,
        title: "Test Property",
        ...mockUpdate,
        address: "123 Test St",
        bedrooms: 3,
        bathrooms: 2,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
        agentId: 1,
      };

      (prisma.property.update as jest.Mock).mockResolvedValue(updatedProperty);

      const request = new NextRequest(
        "http://localhost:3000/api/properties/1",
        {
          method: "PATCH",
          body: JSON.stringify(mockUpdate),
        }
      );

      const response = await PATCH(request, { params: { id: "1" } } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedProperty);
      expect(prisma.property.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: mockUpdate,
      });
    });

    it("returns 404 for non-existent property", async () => {
      (prisma.property.update as jest.Mock).mockRejectedValue(
        new Error("Record not found")
      );

      const request = new NextRequest(
        "http://localhost:3000/api/properties/999",
        {
          method: "PATCH",
          body: JSON.stringify(mockUpdate),
        }
      );

      const response = await PATCH(request, { params: { id: "999" } } as any);
      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/properties/[id]", () => {
    it("deletes an existing property", async () => {
      (prisma.property.delete as jest.Mock).mockResolvedValue({ id: 1 });

      const request = new NextRequest(
        "http://localhost:3000/api/properties/1",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request, { params: { id: "1" } } as any);
      expect(response.status).toBe(204);
      expect(prisma.property.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("returns 404 for non-existent property", async () => {
      (prisma.property.delete as jest.Mock).mockRejectedValue(
        new Error("Record not found")
      );

      const request = new NextRequest(
        "http://localhost:3000/api/properties/999",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request, { params: { id: "999" } } as any);
      expect(response.status).toBe(404);
    });
  });
});
