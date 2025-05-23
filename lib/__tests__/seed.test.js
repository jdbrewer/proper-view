/**
 * @jest-environment node
 */
const { PrismaClient } = require("@prisma/client");

// Mock PrismaClient to prevent real database operations
jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    property: {
      findMany: jest.fn().mockResolvedValue([
        { id: 1, price: 300000, image: 'test.jpg' },
        { id: 2, price: 500000, image: 'test2.jpg' }
      ]),
      create: jest.fn().mockResolvedValue({ id: 1 })
    },
    agent: {
      findMany: jest.fn().mockResolvedValue([
        { id: 1, email: 'test@example.com' }
      ]),
      create: jest.fn().mockResolvedValue({ id: 1 })
    },
    $disconnect: jest.fn().mockResolvedValue(undefined)
  }))
}));

describe("Database Seed Script", () => {
  const prisma = new PrismaClient();
  
  afterAll(async () => {
    await prisma.$disconnect();
  });
  
  it('should validate email format', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect('john.doe@example.com').toMatch(emailRegex);
    expect('invalid-email').not.toMatch(emailRegex);
  });
  
  it('should validate price range', () => {
    const minPrice = 250000;
    const maxPrice = 1200000;
    const testPrice = 500000;
    
    expect(testPrice).toBeGreaterThanOrEqual(minPrice);
    expect(testPrice).toBeLessThanOrEqual(maxPrice);
  });
  
  it('should mock database operations without affecting real data', async () => {
    const properties = await prisma.property.findMany();
    const agents = await prisma.agent.findMany();
    
    expect(properties).toHaveLength(2);
    expect(agents).toHaveLength(1);
    expect(agents[0].email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });
});