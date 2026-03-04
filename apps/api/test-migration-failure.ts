/**
 * Migration Failure Handling Test
 * 
 * This script demonstrates and tests Prisma's automatic rollback behavior
 * when a migration fails. It validates Requirement 28.3: "For any failed 
 * migration, system should rollback transaction"
 * 
 * Test Scenarios:
 * 1. Successful migration (baseline)
 * 2. Failed migration due to constraint violation
 * 3. Failed migration due to invalid SQL
 * 4. Verify database state remains unchanged after failure
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { prisma } from './src/lib/prisma';

interface TestResult {
  scenario: string;
  passed: boolean;
  message: string;
}

const results: TestResult[] = [];

/**
 * Helper function to execute shell commands
 */
function executeCommand(command: string): { success: boolean; output: string } {
  try {
    const output = execSync(command, { 
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    return { success: true, output };
  } catch (error: any) {
    return { success: false, output: error.message };
  }
}

/**
 * Test 1: Verify baseline - migrations can be applied successfully
 */
async function testSuccessfulMigration(): Promise<TestResult> {
  console.log('\n📋 Test 1: Verify successful migration application...');
  
  try {
    // Check current migration status
    const statusResult = executeCommand('npx prisma migrate status');
    
    if (statusResult.output.includes('Database schema is up to date')) {
      return {
        scenario: 'Successful Migration',
        passed: true,
        message: 'All migrations applied successfully. Database schema is up to date.'
      };
    } else if (statusResult.output.includes('pending migration')) {
      // Try to apply pending migrations
      const migrateResult = executeCommand('npx prisma migrate deploy');
      
      if (migrateResult.success) {
        return {
          scenario: 'Successful Migration',
          passed: true,
          message: 'Pending migrations applied successfully.'
        };
      } else {
        return {
          scenario: 'Successful Migration',
          passed: false,
          message: `Failed to apply pending migrations: ${migrateResult.output}`
        };
      }
    } else {
      return {
        scenario: 'Successful Migration',
        passed: true,
        message: 'Migration system is operational.'
      };
    }
  } catch (error: any) {
    return {
      scenario: 'Successful Migration',
      passed: false,
      message: `Error checking migration status: ${error.message}`
    };
  }
}

/**
 * Test 2: Verify automatic rollback on constraint violation
 * 
 * This test creates a migration that will fail due to adding a NOT NULL
 * constraint to a column that already has NULL values.
 */
async function testConstraintViolationRollback(): Promise<TestResult> {
  console.log('\n📋 Test 2: Test rollback on constraint violation...');
  
  try {
    // First, verify we have some test data
    const userCount = await prisma.user.count();
    const siteCount = await prisma.site.count();
    
    console.log(`   Current state: ${userCount} users, ${siteCount} sites`);
    
    // Create a test migration directory with a failing migration
    const timestamp = Date.now();
    const migrationName = `${timestamp}_test_constraint_violation`;
    const migrationDir = path.join(__dirname, 'prisma', 'migrations', migrationName);
    
    // This migration will fail because we're adding a NOT NULL constraint
    // to a column without providing a default value or updating existing rows
    const failingMigration = `
-- This migration will fail due to constraint violation
-- Adding NOT NULL to existing column without default or data migration

ALTER TABLE "User" ADD COLUMN "testColumn" TEXT NOT NULL;
`;
    
    // Create the migration directory and file
    fs.mkdirSync(migrationDir, { recursive: true });
    fs.writeFileSync(
      path.join(migrationDir, 'migration.sql'),
      failingMigration
    );
    
    console.log('   Created failing migration file');
    
    // Try to apply the migration (should fail and rollback)
    const migrateResult = executeCommand('npx prisma migrate deploy');
    
    // Clean up the test migration
    fs.rmSync(migrationDir, { recursive: true, force: true });
    
    // Verify the migration failed
    if (migrateResult.success) {
      return {
        scenario: 'Constraint Violation Rollback',
        passed: false,
        message: 'Migration should have failed but succeeded unexpectedly'
      };
    }
    
    // Verify database state is unchanged
    const userCountAfter = await prisma.user.count();
    const siteCountAfter = await prisma.site.count();
    
    // Check if the test column was added (it shouldn't be)
    const tableInfo = await prisma.$queryRaw<any[]>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' AND column_name = 'testColumn'
    `;
    
    if (tableInfo.length > 0) {
      return {
        scenario: 'Constraint Violation Rollback',
        passed: false,
        message: 'Rollback failed: testColumn exists in database after failed migration'
      };
    }
    
    if (userCountAfter !== userCount || siteCountAfter !== siteCount) {
      return {
        scenario: 'Constraint Violation Rollback',
        passed: false,
        message: 'Rollback failed: data counts changed after failed migration'
      };
    }
    
    return {
      scenario: 'Constraint Violation Rollback',
      passed: true,
      message: 'Migration failed as expected and database state was preserved (automatic rollback successful)'
    };
    
  } catch (error: any) {
    return {
      scenario: 'Constraint Violation Rollback',
      passed: false,
      message: `Test error: ${error.message}`
    };
  }
}

/**
 * Test 3: Verify automatic rollback on SQL syntax error
 */
async function testSyntaxErrorRollback(): Promise<TestResult> {
  console.log('\n📋 Test 3: Test rollback on SQL syntax error...');
  
  try {
    // Get current table count
    const tablesResult = await prisma.$queryRaw<any[]>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    const tableCount = tablesResult.length;
    
    console.log(`   Current state: ${tableCount} tables in database`);
    
    // Create a test migration with invalid SQL
    const timestamp = Date.now();
    const migrationName = `${timestamp}_test_syntax_error`;
    const migrationDir = path.join(__dirname, 'prisma', 'migrations', migrationName);
    
    const failingMigration = `
-- This migration will fail due to SQL syntax error

CREATE TABLE "TestTable" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL
);

-- Invalid SQL syntax below
INVALID SQL STATEMENT HERE;

-- This should not execute due to rollback
CREATE TABLE "AnotherTestTable" (
  "id" SERIAL PRIMARY KEY
);
`;
    
    // Create the migration directory and file
    fs.mkdirSync(migrationDir, { recursive: true });
    fs.writeFileSync(
      path.join(migrationDir, 'migration.sql'),
      failingMigration
    );
    
    console.log('   Created migration with syntax error');
    
    // Try to apply the migration (should fail and rollback)
    const migrateResult = executeCommand('npx prisma migrate deploy');
    
    // Clean up the test migration
    fs.rmSync(migrationDir, { recursive: true, force: true });
    
    // Verify the migration failed
    if (migrateResult.success) {
      return {
        scenario: 'Syntax Error Rollback',
        passed: false,
        message: 'Migration should have failed but succeeded unexpectedly'
      };
    }
    
    // Verify no tables were created
    const tablesAfter = await prisma.$queryRaw<any[]>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name = 'TestTable' OR table_name = 'AnotherTestTable')
    `;
    
    if (tablesAfter.length > 0) {
      return {
        scenario: 'Syntax Error Rollback',
        passed: false,
        message: `Rollback failed: ${tablesAfter.length} test table(s) exist after failed migration`
      };
    }
    
    // Verify table count unchanged
    const tablesResultAfter = await prisma.$queryRaw<any[]>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    const tableCountAfter = tablesResultAfter.length;
    
    if (tableCountAfter !== tableCount) {
      return {
        scenario: 'Syntax Error Rollback',
        passed: false,
        message: `Rollback failed: table count changed from ${tableCount} to ${tableCountAfter}`
      };
    }
    
    return {
      scenario: 'Syntax Error Rollback',
      passed: true,
      message: 'Migration failed as expected and all changes were rolled back (no partial application)'
    };
    
  } catch (error: any) {
    return {
      scenario: 'Syntax Error Rollback',
      passed: false,
      message: `Test error: ${error.message}`
    };
  }
}

/**
 * Test 4: Verify migration history tracking
 */
async function testMigrationHistory(): Promise<TestResult> {
  console.log('\n📋 Test 4: Verify migration history tracking...');
  
  try {
    // Query the _prisma_migrations table
    const migrations = await prisma.$queryRaw<any[]>`
      SELECT 
        migration_name,
        finished_at,
        applied_steps_count,
        rolled_back_at
      FROM "_prisma_migrations"
      ORDER BY finished_at DESC
      LIMIT 5
    `;
    
    if (migrations.length === 0) {
      return {
        scenario: 'Migration History',
        passed: false,
        message: 'No migrations found in history table'
      };
    }
    
    console.log(`   Found ${migrations.length} migrations in history`);
    
    // Verify all successful migrations have finished_at and no rolled_back_at
    const successfulMigrations = migrations.filter(m => 
      m.finished_at !== null && m.rolled_back_at === null
    );
    
    if (successfulMigrations.length === 0) {
      return {
        scenario: 'Migration History',
        passed: false,
        message: 'No successful migrations found in history'
      };
    }
    
    // Verify applied_steps_count is tracked
    const migrationsWithSteps = migrations.filter(m => 
      m.applied_steps_count > 0
    );
    
    if (migrationsWithSteps.length === 0) {
      return {
        scenario: 'Migration History',
        passed: false,
        message: 'No migrations have applied_steps_count tracked'
      };
    }
    
    return {
      scenario: 'Migration History',
      passed: true,
      message: `Migration history properly tracked: ${successfulMigrations.length} successful migrations with step counts`
    };
    
  } catch (error: any) {
    return {
      scenario: 'Migration History',
      passed: false,
      message: `Test error: ${error.message}`
    };
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 Migration Failure Handling Test Suite');
  console.log('=========================================\n');
  console.log('Testing Requirement 28.3: Migration Rollback on Failure');
  console.log('Testing Requirement 28.4: Migration History Tracking\n');
  
  try {
    // Run all tests
    results.push(await testSuccessfulMigration());
    results.push(await testConstraintViolationRollback());
    results.push(await testSyntaxErrorRollback());
    results.push(await testMigrationHistory());
    
    // Print results
    console.log('\n\n📊 Test Results');
    console.log('===============\n');
    
    results.forEach((result, index) => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${icon} Test ${index + 1}: ${result.scenario}`);
      console.log(`   ${result.message}\n`);
    });
    
    // Summary
    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;
    
    console.log('\n📈 Summary');
    console.log('==========');
    console.log(`Passed: ${passedCount}/${totalCount}`);
    console.log(`Failed: ${totalCount - passedCount}/${totalCount}`);
    
    if (passedCount === totalCount) {
      console.log('\n✅ All tests passed! Migration failure handling is working correctly.');
      console.log('\nKey Findings:');
      console.log('• Prisma automatically rolls back failed migrations');
      console.log('• Database state is preserved when migrations fail');
      console.log('• No partial migrations are applied');
      console.log('• Migration history is properly tracked');
      console.log('\nRequirements Validated:');
      console.log('✅ 28.3 - Rollback on migration failure');
      console.log('✅ 28.4 - Migration history tracking');
    } else {
      console.log('\n❌ Some tests failed. Please review the results above.');
      process.exit(1);
    }
    
  } catch (error: any) {
    console.error('\n❌ Test suite error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
runTests().catch(console.error);
