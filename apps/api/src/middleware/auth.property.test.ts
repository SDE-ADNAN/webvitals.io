/**
 * Property-based tests for JWT authentication middleware
 * Feature: backend-api, Property 2: JWT Token Validation
 * Validates: Requirements 5.3
 */

import * as fc from 'fast-check';
import { Request, Response } from 'express';
import { authenticate, AuthRequest } from './auth';
import { signToken } from '../utils/jwt';

describe('JWT Token Validation Property Tests', () => {
  /**
   * Property 2: JWT Token Validation
   * For any protected endpoint request, a valid JWT token should be required
   */
  describe('Feature: backend-api, Property 2: JWT Token Validation', () => {
    // Helper to create mock request/response
    const createMockReq = (authHeader?: string): AuthRequest => {
      return {
        headers: authHeader ? { authorization: authHeader } : {},
      } as AuthRequest;
    };

    const createMockRes = () => {
      const res = {} as Response;
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };

    const createMockNext = () => jest.fn();

    it('should require authentication header for any request', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant(undefined), // No auth header
          async () => {
            const req = createMockReq();
            const res = createMockRes();
            const next = createMockNext();

            authenticate(req, res, next);

            // Property: Missing auth header should return 401
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
              expect.objectContaining({
                error: 'Unauthorized',
                message: 'Authentication required',
              })
            );
            expect(next).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should require Bearer format for any authorization header', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.startsWith('Bearer ')),
          async (invalidHeader) => {
            const req = createMockReq(invalidHeader);
            const res = createMockRes();
            const next = createMockNext();

            authenticate(req, res, next);

            // Property: Non-Bearer format should return 401
            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept any valid JWT token with correct payload', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }), // userId
          fc.emailAddress(), // email
          async (userId, email) => {
            // Generate valid token
            const token = signToken({ userId, email });
            const req = createMockReq(`Bearer ${token}`);
            const res = createMockRes();
            const next = createMockNext();

            authenticate(req, res, next);

            // Property: Valid token should attach user and call next
            expect(req.user).toBeDefined();
            expect(req.user?.userId).toBe(userId);
            expect(req.user?.email).toBe(email);
            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject any invalid token format', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => {
            // Filter out valid JWT patterns (xxx.yyy.zzz)
            const parts = s.split('.');
            return parts.length !== 3;
          }),
          async (invalidToken) => {
            const req = createMockReq(`Bearer ${invalidToken}`);
            const res = createMockRes();
            const next = createMockNext();

            authenticate(req, res, next);

            // Property: Invalid token should return 401
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
              expect.objectContaining({
                error: 'Unauthorized',
              })
            );
            expect(next).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject tokens with tampered signature', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.emailAddress(),
          async (userId, email) => {
            // Generate valid token
            const token = signToken({ userId, email });
            
            // Tamper with the signature part (last part after last dot)
            const parts = token.split('.');
            if (parts.length === 3) {
              // Change last character of signature
              const signature = parts[2];
              const tamperedSignature = signature.slice(0, -1) + 
                                       (signature.slice(-1) === 'a' ? 'b' : 'a');
              const tamperedToken = `${parts[0]}.${parts[1]}.${tamperedSignature}`;
              
              const req = createMockReq(`Bearer ${tamperedToken}`);
              const res = createMockRes();
              const next = createMockNext();

              authenticate(req, res, next);

              // Property: Tampered signature should return 401
              expect(res.status).toHaveBeenCalledWith(401);
              expect(next).not.toHaveBeenCalled();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle empty Bearer token', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant('Bearer '), // Empty token after Bearer
          async (authHeader) => {
            const req = createMockReq(authHeader);
            const res = createMockRes();
            const next = createMockNext();

            authenticate(req, res, next);

            // Property: Empty token should return 401
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
              expect.objectContaining({
                error: 'Unauthorized',
                message: 'Token not provided',
              })
            );
            expect(next).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
