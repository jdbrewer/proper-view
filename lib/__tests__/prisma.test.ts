/**
 * @jest-environment node
 */
import { PrismaClient } from '@prisma/client'

describe('Prisma Database Connection', () => {
  let prisma: PrismaClient

  beforeAll(() => {
    prisma = new PrismaClient()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('should connect to the database', async () => {
    // This will throw an error if the connection fails
    await expect(prisma.$connect()).resolves.not.toThrow()
  })

  it('should be able to query the database', async () => {
    // Try a simple query to verify we can interact with the database
    const result = await prisma.$queryRaw`SELECT 1 as test`
    expect(result).toEqual([{ test: 1n }])
  })
}) 