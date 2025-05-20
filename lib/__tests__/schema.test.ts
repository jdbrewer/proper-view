/**
 * @jest-environment node
 */
import { PrismaClient } from '@prisma/client'

describe('Prisma Schema Validation', () => {
  const prisma = new PrismaClient()

  afterAll(async () => {
    // Clean up test data
    await prisma.inquiry.deleteMany({})
    await prisma.property.deleteMany({})
    await prisma.agent.deleteMany({})
    await prisma.$disconnect()
  })

  it('should create an agent, property, and inquiry with correct relationships', async () => {
    const agent = await prisma.agent.create({
      data: {
        name: 'Test Agent',
        email: 'testagent@example.com',
      },
    })

    const property = await prisma.property.create({
      data: {
        title: 'Test Property',
        description: 'A great place',
        price: 500000,
        address: '123 Main St',
        bedrooms: 3,
        bathrooms: 2,
        agentId: agent.id,
      },
    })

    const inquiry = await prisma.inquiry.create({
      data: {
        name: 'Interested Buyer',
        email: 'buyer@example.com',
        phone: '1234567890',
        message: 'Is this still available?',
        propertyId: property.id,
      },
    })

    // Check relationships
    const foundProperty = await prisma.property.findUnique({
      where: { id: property.id },
      include: { agent: true, inquiries: true },
    })
    expect(foundProperty?.agent.email).toBe('testagent@example.com')
    expect(foundProperty?.inquiries[0].email).toBe('buyer@example.com')
  })
}) 