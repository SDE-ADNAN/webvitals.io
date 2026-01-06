/**
 * Jest test setup file
 * Runs before all tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.JWT_EXPIRES_IN = '7d';
process.env.PORT = '4001';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/webvitals_test';
process.env.LOG_LEVEL = 'error';

// Increase timeout for property-based tests
jest.setTimeout(30000);
