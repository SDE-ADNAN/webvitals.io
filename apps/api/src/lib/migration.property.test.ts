/**
 * Property-based tests for database migration rollback
 * Feature: backend-api, Property 15: Migration Rollback on Failure
 * Validates: Requirements 28.3
 */

import * as fc from 'fast-check';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { prisma } from './prisma';

/**
 * Helper to execute shell commands
 */
function executeCommand(command: string): { success: boolean; output: string; error?: string } {
  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: 'pipe',
      cwd: path.join(__dirname, '../..'),
    });
    return { success: true, output };
  } catch (error: any) {
    return {
      success: false,
      output: error.stdout || '',
      error: error.stderr || error.message,
    };
  }
}

/**
 * Helper to create a test migration file
 */
function createTestMigration(name: string, sql: string): string {
  const timestamp = Date.now();
  const migrationName = `${timestamp}_${name}`;
  const migrationDir = path.join(__dirname, '../../prisma/migrations', migrationName);

  fs.mkdirSync(migrationDir, { recursive: true });
  fs.writeFileSync(path.join(migrationDir, 'migration.sql'), sql);

  return migrationDir;
}

/**
 * Helper to clean up test migration
 */
function cleanupTestMigration(migrationDir: string): void {
  if (fs.existsSync(migrationDir)) {
    fs.rmSync(migrationDir, { recursive: true, force: true });
  }
}

/**
 * Helper to get database state snapshot
 */
async function getDatabaseSnapshot(): Promise<{
  userCount: number;
  siteCount: number;
  metricCount: number;
  alertCount: number;
  tables: string[];
}> {
  const [userCount, siteCount, metricCount, alertCount] = await Promise.all([
    prisma.user.count(),
    prisma.site.count(),
    prisma.metric.count(),
    prisma.alert.count(),
  ]);

  const tablesResult = await prisma.$queryRaw<Array<{ table_name: string }>>`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `;

  return {
    userCount,
    siteCount,
    metricCount,
    alertCount,
    tables: tablesResult.map((t) => t.table_name),
  };
}

/**
 * Helper to check if a column exists in a table
 */
async function columnExists(tableName: string, columnName: string): Promise<boolean> {
  const result = await prisma.$queryRaw<Array<{ column_name: string }>>`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = ${tableName} 
    AND column_name = ${columnName}
  `;
  return result.length > 0;
}

/**
 * Helper to check if a table exists
 */
async function tableExists(tableName: string): Promise<boolean> {
  const result = await prisma.$queryRaw<Array<{ table_name: string }>>`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = ${tableName}
  `;
  return result.length > 0;
}

describe('Migration Rollback Property Tests', () => {
  beforeAll(async () => {
    // Ensure database is in a known state
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  /**
   * Property 15: Migration Rollback on Failure
   * For any failed migration, system should rollback transaction
   * **Validates: Requirements 28.3**
   */
  describe('Feature: backend-api, Property 15: Migration Rollback on Failure', () => {
    it('should rollback any migration that fails due to constraint violations', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 3, maxLength: 20 }).filter((s) => /^[a-z_]+$/.test(s)), // Valid column name
          fc.constantFrom('TEXT', 'INTEGER', 'BOOLEAN', 'TIMESTAMP'), // SQL data types
          async (columnName, dataType) => {
            // Get initial database state
            const initialState = await getDatabaseSnapshot();

            // Create a migration that will fail (adding NOT NULL column without default)
            const failingMigration = `
-- This migration will fail due to constraint violation
ALTER TABLE "User" ADD COLUMN "${columnName}" ${dataType} NOT NULL;
`;

            const migrationDir = createTestMigration(
              `test_constraint_violation_${columnName}`,
              failingMigration
            );

            try {
              // Attempt to apply the migration (should fail)
              const result = executeCommand('npx prisma migrate deploy');

              // Property: Migration should fail
              expect(result.success).toBe(false);

              // Property: Database state should be unchanged after rollback
              const finalState = await getDatabaseSnapshot();
              expect(finalState.userCount).toBe(initialState.userCount);
              expect(finalState.siteCount).toBe(initialState.siteCount);
              expect(finalState.metricCount).toBe(initialState.metricCount);
              expect(finalState.alertCount).toBe(initialState.alertCount);
              expect(finalState.tables).toEqual(initialState.tables);

              // Property: Column should not exist after rollback
              const colExists = await columnExists('User', columnName);
              expect(colExists).toBe(false);
            } finally {
              // Cleanup
              cleanupTestMigration(migrationDir);
            }
          }
        ),
        { numRuns: 20 } // Reduced runs due to database operations
      );
    }, 60000); // Increased timeout for database operations

    it('should rollback any migration that fails due to SQL syntax errors', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 3, maxLength: 20 }).filter((s) => /^[a-z_]+$/.test(s)), // Valid table name
          async (tableName) => {
            // Get initial database state
            const initialState = await getDatabaseSnapshot();

            // Create a migration with SQL syntax error
            const failingMigration = `
-- This migration will fail due to syntax error
CREATE TABLE "${tableName}" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL
);

-- Invalid SQL syntax
INVALID SQL STATEMENT HERE;

-- This should not execute due to rollback
ALTER TABLE "${tableName}" ADD COLUMN "extra" TEXT;
`;

            const migrationDir = createTestMigration(
              `test_syntax_error_${tableName}`,
              failingMigration
            );

            try {
              // Attempt to apply the migration (should fail)
              const result = executeCommand('npx prisma migrate deploy');

              // Property: Migration should fail
              expect(result.success).toBe(false);

              // Property: Database state should be unchanged after rollback
              const finalState = await getDatabaseSnapshot();
              expect(finalState.userCount).toBe(initialState.userCount);
              expect(finalState.siteCount).toBe(initialState.siteCount);
              expect(finalState.metricCount).toBe(initialState.metricCount);
              expect(finalState.alertCount).toBe(initialState.alertCount);

              // Property: No partial changes - table should not exist
              const tblExists = await tableExists(tableName);
              expect(tblExists).toBe(false);

              // Property: Table count should be unchanged
              expect(finalState.tables.length).toBe(initialState.tables.length);
            } finally {
              // Cleanup
              cleanupTestMigration(migrationDir);
            }
          }
        ),
        { numRuns: 20 } // Reduced runs due to database operations
      );
    }, 60000); // Increased timeout for database operations

    it('should rollback any migration that fails due to foreign key violations', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 3, maxLength: 20 }).filter((s) => /^[a-z_]+$/.test(s)), // Valid table name
          async (tableName) => {
            // Get initial database state
            const initialState = await getDatabaseSnapshot();

            // Create a migration that will fail due to foreign key constraint
            const failingMigration = `
-- This migration will fail due to foreign key violation
CREATE TABLE "${tableName}" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "data" TEXT,
  CONSTRAINT "fk_nonexistent_user" FOREIGN KEY ("userId") REFERENCES "NonExistentTable"("id")
);
`;

            const migrationDir = createTestMigration(
              `test_fk_violation_${tableName}`,
              failingMigration
            );

            try {
              // Attempt to apply the migration (should fail)
              const result = executeCommand('npx prisma migrate deploy');

              // Property: Migration should fail
              expect(result.success).toBe(false);

              // Property: Database state should be unchanged after rollback
              const finalState = await getDatabaseSnapshot();
              expect(finalState.userCount).toBe(initialState.userCount);
              expect(finalState.siteCount).toBe(initialState.siteCount);
              expect(finalState.metricCount).toBe(initialState.metricCount);
              expect(finalState.alertCount).toBe(initialState.alertCount);

              // Property: Table should not exist after rollback
              const tblExists = await tableExists(tableName);
              expect(tblExists).toBe(false);

              // Property: Table list should be unchanged
              expect(finalState.tables).toEqual(initialState.tables);
            } finally {
              // Cleanup
              cleanupTestMigration(migrationDir);
            }
          }
        ),
        { numRuns: 20 } // Reduced runs due to database operations
      );
    }, 60000); // Increased timeout for database operations

    it('should preserve all data when any migration fails and rolls back', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 3, maxLength: 20 }).filter((s) => /^[a-z_]+$/.test(s)), // Column name
          fc.integer({ min: 1, max: 100 }), // Random number for uniqueness
          async (columnName, randomNum) => {
            // Get initial data counts
            const initialState = await getDatabaseSnapshot();

            // Create a migration that modifies data then fails
            const failingMigration = `
-- Add a temporary column
ALTER TABLE "User" ADD COLUMN "temp_${columnName}_${randomNum}" TEXT;

-- Update some data
UPDATE "User" SET "temp_${columnName}_${randomNum}" = 'test_value';

-- This will fail
ALTER TABLE "NonExistentTable" ADD COLUMN "fail" TEXT;
`;

            const migrationDir = createTestMigration(
              `test_data_preservation_${columnName}_${randomNum}`,
              failingMigration
            );

            try {
              // Attempt to apply the migration (should fail)
              const result = executeCommand('npx prisma migrate deploy');

              // Property: Migration should fail
              expect(result.success).toBe(false);

              // Property: All data counts should be preserved
              const finalState = await getDatabaseSnapshot();
              expect(finalState.userCount).toBe(initialState.userCount);
              expect(finalState.siteCount).toBe(initialState.siteCount);
              expect(finalState.metricCount).toBe(initialState.metricCount);
              expect(finalState.alertCount).toBe(initialState.alertCount);

              // Property: Temporary column should not exist (rollback successful)
              const colExists = await columnExists('User', `temp_${columnName}_${randomNum}`);
              expect(colExists).toBe(false);

              // Property: No data modifications should persist
              // If the column doesn't exist, the UPDATE was also rolled back
            } finally {
              // Cleanup
              cleanupTestMigration(migrationDir);
            }
          }
        ),
        { numRuns: 15 } // Reduced runs due to complex database operations
      );
    }, 90000); // Increased timeout for complex operations

    it('should handle any type of migration failure with proper rollback', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(
            // Different types of SQL errors
            'SYNTAX_ERROR',
            'CONSTRAINT_VIOLATION',
            'TYPE_MISMATCH',
            'DUPLICATE_OBJECT'
          ),
          fc.string({ minLength: 3, maxLength: 15 }).filter((s) => /^[a-z_]+$/.test(s)),
          async (errorType, identifier) => {
            const initialState = await getDatabaseSnapshot();

            let failingMigration = '';

            switch (errorType) {
              case 'SYNTAX_ERROR':
                failingMigration = `
ALTER TABLE "User" ADD COLUMN "${identifier}" TEXT;
INVALID SQL SYNTAX;
`;
                break;
              case 'CONSTRAINT_VIOLATION':
                failingMigration = `
ALTER TABLE "User" ADD COLUMN "${identifier}" TEXT NOT NULL;
`;
                break;
              case 'TYPE_MISMATCH':
                failingMigration = `
ALTER TABLE "User" ADD COLUMN "${identifier}" INTEGER;
INSERT INTO "User" ("${identifier}") VALUES ('not_a_number');
`;
                break;
              case 'DUPLICATE_OBJECT':
                failingMigration = `
CREATE TABLE "User" ("id" SERIAL PRIMARY KEY);
`;
                break;
            }

            const migrationDir = createTestMigration(
              `test_${errorType.toLowerCase()}_${identifier}`,
              failingMigration
            );

            try {
              // Attempt to apply the migration (should fail)
              const result = executeCommand('npx prisma migrate deploy');

              // Property: Any type of migration failure should result in failed status
              expect(result.success).toBe(false);

              // Property: Database state should always be preserved after any failure
              const finalState = await getDatabaseSnapshot();
              expect(finalState.userCount).toBe(initialState.userCount);
              expect(finalState.siteCount).toBe(initialState.siteCount);
              expect(finalState.metricCount).toBe(initialState.metricCount);
              expect(finalState.alertCount).toBe(initialState.alertCount);

              // Property: No partial schema changes should exist
              const colExists = await columnExists('User', identifier);
              expect(colExists).toBe(false);
            } finally {
              // Cleanup
              cleanupTestMigration(migrationDir);
            }
          }
        ),
        { numRuns: 20 } // Reduced runs due to database operations
      );
    }, 90000); // Increased timeout for various operations
  });

  describe('Migration Transaction Atomicity', () => {
    it('should ensure atomicity for any multi-step migration', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 2, max: 5 }), // Number of successful steps before failure
          fc.string({ minLength: 3, maxLength: 15 }).filter((s) => /^[a-z_]+$/.test(s)),
          async (successfulSteps, identifier) => {
            const initialState = await getDatabaseSnapshot();

            // Build a migration with multiple steps that fails at the end
            let migrationSteps = '';
            const columnNames: string[] = [];

            for (let i = 0; i < successfulSteps; i++) {
              const colName = `${identifier}_step${i}`;
              columnNames.push(colName);
              migrationSteps += `ALTER TABLE "User" ADD COLUMN "${colName}" TEXT;\n`;
            }

            // Add a failing step at the end
            migrationSteps += `ALTER TABLE "NonExistentTable" ADD COLUMN "fail" TEXT;\n`;

            const migrationDir = createTestMigration(
              `test_atomicity_${identifier}`,
              migrationSteps
            );

            try {
              // Attempt to apply the migration (should fail)
              const result = executeCommand('npx prisma migrate deploy');

              // Property: Migration should fail
              expect(result.success).toBe(false);

              // Property: Database state should be unchanged
              const finalState = await getDatabaseSnapshot();
              expect(finalState.userCount).toBe(initialState.userCount);

              // Property: None of the successful steps should persist (atomicity)
              for (const colName of columnNames) {
                const colExists = await columnExists('User', colName);
                expect(colExists).toBe(false);
              }

              // Property: Table structure should be identical to initial state
              expect(finalState.tables).toEqual(initialState.tables);
            } finally {
              // Cleanup
              cleanupTestMigration(migrationDir);
            }
          }
        ),
        { numRuns: 15 } // Reduced runs due to complex operations
      );
    }, 90000); // Increased timeout
  });
});
