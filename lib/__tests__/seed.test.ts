/**
 * @jest-environment node
 */
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

describe('Database Seed Script', () => {
  const prisma = new PrismaClient()

  beforeAll(() => {
    // Run the seed script
    execSync('npx prisma db seed', { stdio: 'inherit' })
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it.skip('should seed the database with 18 properties and 3 agents', async () => {
    const properties = await prisma.property.findMany()
    const agents = await prisma.agent.findMany()

    expect(properties.length).toBe(18)
    expect(agents.length).toBe(3)
  })

  it.skip('should ensure data quality (valid email, non-negative price)', async () => {
    const properties = await prisma.property.findMany()
    const agents = await prisma.agent.findMany()

    // Check agent email
    expect(agents[0].email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)

    // Check property prices
    properties.forEach(property => {
      expect(property.price).toBeGreaterThanOrEqual(0)
    })
  })

  it.skip('should ensure every property has a non-empty image URL', async () => {
    const properties = await prisma.property.findMany();
    properties.forEach(property => {
      expect(property.image).toBeDefined();
      expect(typeof property.image).toBe('string');
      expect(property.image).not.toBe('');
    });
  });
}) 