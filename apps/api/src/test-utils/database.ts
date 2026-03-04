/**
 * Database utilities for testing
 * Provides functions to reset and seed test database
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Create a connection pool for testing
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5, // Smaller pool for testing
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['error'],
});

/**
 * Reset the test database by deleting all data
 * Maintains referential integrity by deleting in correct order
 */
export async function resetDatabase(): Promise<void> {
  try {
    // Delete in order to respect foreign key constraints
    await prisma.metric.deleteMany({});
    await prisma.alert.deleteMany({});
    await prisma.site.deleteMany({});
    await prisma.user.deleteMany({});
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
}

/**
 * Disconnect from the database
 * Should be called after all tests complete
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  await pool.end();
}

/**
 * Connect to the database
 * Should be called before tests run
 */
export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
}

export { prisma as testPrisma };
