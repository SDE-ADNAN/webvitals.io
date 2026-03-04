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

// Create PostgreSQL connection pool with configuration
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  // Connection pool configuration
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
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

// Export pool for shutdown handling
export const connectionPool = pool;

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
 * Closes both Prisma client and the underlying connection pool
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    // Disconnect Prisma client
    await prisma.$disconnect();
    console.log("✅ Prisma client disconnected successfully");
    
    // Close the connection pool to release all connections
    await connectionPool.end();
    console.log("✅ Connection pool closed successfully");
  } catch (error) {
    console.error(
      "❌ Error disconnecting from database:",
      error instanceof Error ? error.message : error
    );
    throw error; // Re-throw to ensure shutdown process is aware of the error
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

/**
 * Execute a database operation with retry logic and error logging
 * Retries up to 3 times with exponential backoff on failure
 * 
 * @param operation - The database operation to execute
 * @param context - Context information for logging (e.g., "createUser", "getSite")
 * @returns The result of the operation
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> {
  const maxRetries = 3;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      retries++;
      const waitTime = Math.pow(2, retries) * 1000; // Exponential backoff: 2s, 4s, 8s

      console.error(
        `❌ Database operation "${context}" attempt ${retries}/${maxRetries} failed:`,
        {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
          context,
          timestamp: new Date().toISOString(),
        }
      );

      if (retries < maxRetries) {
        console.log(`⏳ Retrying "${context}" in ${waitTime / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      } else {
        console.error(
          `❌ Database operation "${context}" failed after ${maxRetries} attempts`
        );
        throw error; // Re-throw the original error after all retries exhausted
      }
    }
  }

  // This should never be reached, but TypeScript needs it
  throw new Error(`Unexpected error in executeWithRetry for context: ${context}`);
}

/**
 * Log database errors with context
 * Provides structured error logging for debugging
 * 
 * @param error - The error that occurred
 * @param context - Context information (operation name, user ID, etc.)
 */
export function logDatabaseError(error: unknown, context: Record<string, any>): void {
  console.error("❌ Database error:", {
    error: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
    timestamp: new Date().toISOString(),
  });
}
