/**
 * Jest test setup file
 * Runs before all tests
 */

// Set test environment variables BEFORE any imports
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.JWT_EXPIRES_IN = '7d';
process.env.PORT = '4001';
process.env.FRONTEND_URL = 'http://localhost:3000';
// Use TEST_DATABASE_URL if available, otherwise fall back to a test database
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://adnankhan@localhost:5432/webvitals_test';
process.env.LOG_LEVEL = 'error';

// Increase timeout for property-based tests
jest.setTimeout(30000);

// Import database utilities after environment variables are set
import { resetDatabase, disconnectDatabase, connectDatabase } from './test-utils/database';

// Global setup - runs once before all test suites
beforeAll(async () => {
  await connectDatabase();
});

// Global teardown - runs once after all test suites
afterAll(async () => {
  await disconnectDatabase();
});

// Reset database before each test suite
// This ensures test isolation
beforeEach(async () => {
  await resetDatabase();
});
