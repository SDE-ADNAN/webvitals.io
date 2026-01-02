/**
 * Property-based tests for authentication service
 * Feature: backend-api, Property 19: Duplicate Email Prevention
 * Validates: Requirements 3.3
 */

import * as fc from 'fast-check';
import { prisma } from '../lib/prisma';

// Mock prisma
jest.mock('../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

describe('Authentication Service Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 19: Duplicate Email Prevention
   * For any registration with existing email, system should return 409
   */
  describe('Feature: backend-api, Property 19: Duplicate Email Prevention', () => {
    it('should reject any duplicate email registration with 409', async () => {
      const { registerUser } = await import('./authService');
      
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 8, maxLength: 50 }),
          async (email, password) => {
            // Mock: First call returns null (email doesn't exist)
            // Second call returns existing user (email exists)
            const mockUser = {
              id: 1,
              email,
              password: 'hashed',
              firstName: 'Test',
              lastName: 'User',
              avatar: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            (prisma.user.findUnique as jest.Mock)
              .mockResolvedValueOnce(null) // First check: email doesn't exist
              .mockResolvedValueOnce(mockUser); // Second check: email exists

            (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

            // First registration should succeed
            const firstResult = await registerUser({
              email,
              password,
              firstName: 'Test',
              lastName: 'User',
            });

            expect(firstResult.token).toBeDefined();
            expect(firstResult.user.email).toBe(email);

            // Second registration with same email should fail with 409
            try {
              await registerUser({
                email,
                password: 'different-password',
                firstName: 'Different',
                lastName: 'User',
              });

              // If we reach here, the test should fail
              fail('Expected duplicate email to throw error');
            } catch (error) {
              // Property: Duplicate email should throw error with statusCode 409
              expect(error).toBeInstanceOf(Error);
              expect((error as any).statusCode).toBe(409);
              expect((error as Error).message).toContain('already registered');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should allow registration with different emails', async () => {
      const { registerUser } = await import('./authService');
      
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.emailAddress(),
          fc.string({ minLength: 8, maxLength: 50 }),
          async (email1, email2, password) => {
            // Skip if emails are the same
            fc.pre(email1 !== email2);

            const mockUser1 = {
              id: 1,
              email: email1,
              password: 'hashed',
              firstName: 'User',
              lastName: 'One',
              avatar: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            const mockUser2 = {
              id: 2,
              email: email2,
              password: 'hashed',
              firstName: 'User',
              lastName: 'Two',
              avatar: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            // Mock: Both emails don't exist
            (prisma.user.findUnique as jest.Mock)
              .mockResolvedValueOnce(null)
              .mockResolvedValueOnce(null);

            (prisma.user.create as jest.Mock)
              .mockResolvedValueOnce(mockUser1)
              .mockResolvedValueOnce(mockUser2);

            // Both registrations should succeed
            const result1 = await registerUser({
              email: email1,
              password,
              firstName: 'User',
              lastName: 'One',
            });

            const result2 = await registerUser({
              email: email2,
              password,
              firstName: 'User',
              lastName: 'Two',
            });

            // Property: Different emails should both succeed
            expect(result1.token).toBeDefined();
            expect(result2.token).toBeDefined();
            expect(result1.user.email).toBe(email1);
            expect(result2.user.email).toBe(email2);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should validate email format before registration', async () => {
      const { registerUser } = await import('./authService');
      
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('@')),
          fc.string({ minLength: 8, maxLength: 50 }),
          async (invalidEmail, password) => {
            // Property: Invalid email format should be rejected
            try {
              await registerUser({
                email: invalidEmail,
                password,
                firstName: 'Test',
                lastName: 'User',
              });

              fail('Expected invalid email to throw error');
            } catch (error) {
              expect(error).toBeInstanceOf(Error);
              expect((error as Error).message).toContain('Invalid email format');
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
