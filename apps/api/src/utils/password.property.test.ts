/**
 * Property-based tests for password hashing utilities
 * Feature: backend-api, Property 1: Password Hashing
 * Validates: Requirements 20.1, 20.3
 */

import * as fc from 'fast-check';
import { hashPassword, comparePassword } from './password';

describe('Password Hashing Property Tests', () => {
  /**
   * Property 1: Password Hashing
   * For any password, it should be hashed before storage and never returned in responses
   */
  describe('Feature: backend-api, Property 1: Password Hashing', () => {
    it('should hash any password to a different value', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 8, maxLength: 100 }), // Generate passwords 8-100 chars
          async (password) => {
            const hashed = await hashPassword(password);
            
            // Property 1a: Hashed password should be different from original
            expect(hashed).not.toBe(password);
            
            // Property 1b: Hashed password should be a bcrypt hash (starts with $2b$)
            expect(hashed).toMatch(/^\$2b\$/);
            
            // Property 1c: Hashed password should have consistent length (60 chars for bcrypt)
            expect(hashed.length).toBe(60);
          }
        ),
        { numRuns: 100 } // Run 100 iterations as specified in design doc
      );
    });

    it('should produce different hashes for the same password (salt)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 8, maxLength: 100 }),
          async (password) => {
            const hash1 = await hashPassword(password);
            const hash2 = await hashPassword(password);
            
            // Property: Same password should produce different hashes due to salt
            expect(hash1).not.toBe(hash2);
            
            // But both should verify correctly
            expect(await comparePassword(password, hash1)).toBe(true);
            expect(await comparePassword(password, hash2)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly verify any password against its hash', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 8, maxLength: 100 }),
          async (password) => {
            const hashed = await hashPassword(password);
            
            // Property: Original password should always match its hash
            const isValid = await comparePassword(password, hashed);
            expect(isValid).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject any incorrect password', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 8, maxLength: 100 }),
          fc.string({ minLength: 8, maxLength: 100 }),
          async (password1, password2) => {
            // Skip if passwords are the same
            fc.pre(password1 !== password2);
            
            const hashed = await hashPassword(password1);
            
            // Property: Different password should not match the hash
            const isValid = await comparePassword(password2, hashed);
            expect(isValid).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle edge case passwords (special characters, unicode)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 8, maxLength: 100 }), // Includes unicode and special chars
          async (password) => {
            const hashed = await hashPassword(password);
            
            // Property: Any valid string should be hashable and verifiable
            expect(await comparePassword(password, hashed)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
