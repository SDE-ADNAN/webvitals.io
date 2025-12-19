import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { env } from "../config/env";

/**
 * Prisma Client Singleton with PostgreSQL Adapter
 * 
 * This ensures we only create one instance of PrismaClient
 * to avoid connection pool exhaustion in development with hot reloading.
 * 
 * In production, this creates a single client instance.
 * In development, it reuses the client across hot reloads.
 */

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { 
  prisma: PrismaClient;
  pool: Pool;
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    errorFormat: env.NODE_ENV === "development" ? "pretty" : "minimal",
  });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}

/**
 * Connect to the database with error handling
 * Retries connection up to 3 times with exponential backoff
 */
export async function connectDatabase(): Promise<void> {
  const maxRetries = 3;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await prisma.$connect();
      console.log("✅ Database connected successfully");
      return;
    } catch (error) {
      retries++;
      const waitTime = Math.pow(2, retries) * 1000; // Exponential backoff: 2s, 4s, 8s

      console.error(
        `❌ Database connection attempt ${retries}/${maxRetries} failed:`,
        error instanceof Error ? error.message : error
      );

      if (retries < maxRetries) {
        console.log(`⏳ Retrying in ${waitTime / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      } else {
        console.error("❌ Failed to connect to database after maximum retries");
        throw new Error(
          "Database connection failed. Please check your DATABASE_URL and ensure PostgreSQL is running."
        );
      }
    }
  }
}

/**
 * Disconnect from the database gracefully
 * Called during application shutdown
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log("✅ Database disconnected successfully");
  } catch (error) {
    console.error(
      "❌ Error disconnecting from database:",
      error instanceof Error ? error.message : error
    );
  }
}

/**
 * Test database connectivity
 * Used by health check endpoint
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error(
      "Database health check failed:",
      error instanceof Error ? error.message : error
    );
    return false;
  }
}
