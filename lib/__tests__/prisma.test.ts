/**
 * @jest-environment node
 */

// Mock Prisma to avoid real database connections in tests
jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    $queryRaw: jest.fn().mockResolvedValue([{ test: 1 }]),
    agent: {
      count: jest.fn().mockResolvedValue(0),
    },
  })),
}));

import { PrismaClient } from "@prisma/client";

describe("Prisma Database Connection", () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should connect to the database", async () => {
    await expect(prisma.$connect()).resolves.not.toThrow();
  });

  it("should be able to query the database", async () => {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    expect(result).toEqual([{ test: 1 }]);
  });
});
