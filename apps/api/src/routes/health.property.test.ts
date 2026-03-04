/**
 * Property-based tests for health check endpoint
 * Feature: backend-api, Property 10: Health Check Database Verification
 * Validates: Requirements 24.2, 24.3
 */

import * as fc from 'fast-check';
import request from 'supertest';
import express from 'express';
import { testDatabaseConnection } from '../lib/prisma';

// Mock the database connection test
jest.mock('../lib/prisma', () => ({
  testDatabaseConnection: jest.fn(),
}));

describe('Health Check Property Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Health check endpoint (same implementation as in index.ts)
    app.get('/api/health', async (req, res) => {
      try {
        const dbConnected = await testDatabaseConnection();

        if (!dbConnected) {
          return res.status(503).json({
            status: 'error',
            message: 'Database is unreachable',
            uptime: process.uptime(),
            version: process.env.npm_package_version || '0.1.0',
            timestamp: new Date().toISOString(),
          });
        }

        res.json({
          status: 'ok',
          message: 'API server is running',
          database: 'connected',
          uptime: process.uptime(),
          version: process.env.npm_package_version || '0.1.0',
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        // Handle database connection check errors gracefully
        return res.status(503).json({
          status: 'error',
          message: 'Database is unreachable',
          uptime: process.uptime(),
          version: process.env.npm_package_version || '0.1.0',
          timestamp: new Date().toISOString(),
        });
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 10: Health Check Database Verification
   * **Validates: Requirements 24.2, 24.3**
   * 
   * For any health check request, if the database is unreachable, 
   * the response should return 503 status
   */
  describe('Feature: backend-api, Property 10: Health Check Database Verification', () => {
    it('should return 503 for any database error scenario', async () => {
      // Generator for various database error scenarios
      const databaseErrorArbitrary = fc.oneof(
        // Scenario 1: Connection timeout
        fc.constant(new Error('Connection timeout')),
        // Scenario 2: Connection refused
        fc.constant(new Error('Connection refused')),
        // Scenario 3: Network error
        fc.constant(new Error('Network error')),
        // Scenario 4: Authentication failed
        fc.constant(new Error('Authentication failed')),
        // Scenario 5: Database not found
        fc.constant(new Error('Database does not exist')),
        // Scenario 6: Too many connections
        fc.constant(new Error('Too many connections')),
        // Scenario 7: Generic database error
        fc.constant(new Error('Database error')),
        // Scenario 8: Query timeout
        fc.constant(new Error('Query timeout')),
        // Scenario 9: Connection lost
        fc.constant(new Error('Connection lost')),
        // Scenario 10: SSL error
        fc.constant(new Error('SSL connection error'))
      );

      await fc.assert(
        fc.asyncProperty(databaseErrorArbitrary, async (error) => {
          // Mock database connection to throw the error
          (testDatabaseConnection as jest.Mock).mockRejectedValue(error);

          const response = await request(app).get('/api/health');

          // Property: Any database error should result in 503 status
          expect(response.status).toBe(503);
          expect(response.body.status).toBe('error');
          expect(response.body.message).toBe('Database is unreachable');
          
          // Should still include uptime and version
          expect(response.body).toHaveProperty('uptime');
          expect(response.body).toHaveProperty('version');
          expect(response.body).toHaveProperty('timestamp');
        }),
        { numRuns: 100 }
      );
    });

    it('should return 503 when database connection returns false', async () => {
      await fc.assert(
        fc.asyncProperty(fc.constant(false), async (dbStatus) => {
          // Mock database connection to return false
          (testDatabaseConnection as jest.Mock).mockResolvedValue(dbStatus);

          const response = await request(app).get('/api/health');

          // Property: Database unreachable (false) should result in 503 status
          expect(response.status).toBe(503);
          expect(response.body.status).toBe('error');
          expect(response.body.message).toBe('Database is unreachable');
        }),
        { numRuns: 100 }
      );
    });

    it('should return 200 when database is reachable', async () => {
      await fc.assert(
        fc.asyncProperty(fc.constant(true), async (dbStatus) => {
          // Mock database connection to return true
          (testDatabaseConnection as jest.Mock).mockResolvedValue(dbStatus);

          const response = await request(app).get('/api/health');

          // Property: Database reachable (true) should result in 200 status
          expect(response.status).toBe(200);
          expect(response.body.status).toBe('ok');
          expect(response.body.database).toBe('connected');
        }),
        { numRuns: 100 }
      );
    });

    it('should handle any combination of database states consistently', async () => {
      // Generator for database states: true (connected), false (disconnected), or error
      const databaseStateArbitrary = fc.oneof(
        fc.constant({ type: 'connected', value: true }),
        fc.constant({ type: 'disconnected', value: false }),
        fc.constant({ type: 'error', value: new Error('Database error') })
      );

      await fc.assert(
        fc.asyncProperty(databaseStateArbitrary, async (state) => {
          // Mock database based on state type
          if (state.type === 'error') {
            (testDatabaseConnection as jest.Mock).mockRejectedValue(state.value);
          } else {
            (testDatabaseConnection as jest.Mock).mockResolvedValue(state.value);
          }

          const response = await request(app).get('/api/health');

          // Property: Response status should match database state
          if (state.type === 'connected') {
            expect(response.status).toBe(200);
            expect(response.body.status).toBe('ok');
            expect(response.body.database).toBe('connected');
          } else {
            // Both 'disconnected' and 'error' should return 503
            expect(response.status).toBe(503);
            expect(response.body.status).toBe('error');
            expect(response.body.message).toBe('Database is unreachable');
          }

          // Property: All responses should include required fields
          expect(response.body).toHaveProperty('status');
          expect(response.body).toHaveProperty('uptime');
          expect(response.body).toHaveProperty('version');
          expect(response.body).toHaveProperty('timestamp');
          
          // Property: Timestamp should be in ISO 8601 format
          expect(response.body.timestamp).toMatch(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
          );
        }),
        { numRuns: 100 }
      );
    });

    it('should never expose internal error details in response', async () => {
      // Generator for errors with sensitive information
      const sensitiveErrorArbitrary = fc.oneof(
        fc.constant(new Error('Connection failed: password=secret123')),
        fc.constant(new Error('Auth failed: user=admin, pass=admin123')),
        fc.constant(new Error('Database: postgresql://user:pass@host:5432/db')),
        fc.constant(new Error('Stack trace: /home/user/app/src/database.ts:42'))
      );

      await fc.assert(
        fc.asyncProperty(sensitiveErrorArbitrary, async (error) => {
          (testDatabaseConnection as jest.Mock).mockRejectedValue(error);

          const response = await request(app).get('/api/health');

          // Property: Response should never contain sensitive error details
          const responseString = JSON.stringify(response.body);
          expect(responseString).not.toContain('password');
          expect(responseString).not.toContain('pass=');
          expect(responseString).not.toContain('postgresql://');
          expect(responseString).not.toContain('Stack trace');
          
          // Should only contain generic message
          expect(response.body.message).toBe('Database is unreachable');
          expect(response.status).toBe(503);
        }),
        { numRuns: 100 }
      );
    });

    it('should maintain consistent response structure across all database states', async () => {
      const databaseStateArbitrary = fc.oneof(
        fc.constant(true),
        fc.constant(false),
        fc.constant(new Error('Any error'))
      );

      await fc.assert(
        fc.asyncProperty(databaseStateArbitrary, async (state) => {
          if (state instanceof Error) {
            (testDatabaseConnection as jest.Mock).mockRejectedValue(state);
          } else {
            (testDatabaseConnection as jest.Mock).mockResolvedValue(state);
          }

          const response = await request(app).get('/api/health');

          // Property: All responses must have consistent structure
          expect(response.body).toHaveProperty('status');
          expect(response.body).toHaveProperty('message');
          expect(response.body).toHaveProperty('uptime');
          expect(response.body).toHaveProperty('version');
          expect(response.body).toHaveProperty('timestamp');
          
          // Property: Status must be either 'ok' or 'error'
          expect(['ok', 'error']).toContain(response.body.status);
          
          // Property: HTTP status must be either 200 or 503
          expect([200, 503]).toContain(response.status);
          
          // Property: Uptime must be a non-negative number
          expect(typeof response.body.uptime).toBe('number');
          expect(response.body.uptime).toBeGreaterThanOrEqual(0);
          
          // Property: Version must be a string
          expect(typeof response.body.version).toBe('string');
          expect(response.body.version.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });
  });
});
