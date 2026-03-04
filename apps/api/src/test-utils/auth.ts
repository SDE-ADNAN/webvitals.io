/**
 * Authentication utilities for testing
 * Provides functions to generate test tokens and authenticate requests
 */

import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

/**
 * Generate a JWT token for a test user
 */
export function generateTestToken(user: User): string {
  const payload = {
    userId: user.id,
    email: user.email,
  };

  const secret = process.env.JWT_SECRET || 'test-secret-key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Generate an expired JWT token for testing
 */
export function generateExpiredToken(user: User): string {
  const payload = {
    userId: user.id,
    email: user.email,
  };

  const secret = process.env.JWT_SECRET || 'test-secret-key';

  // Create a token that expired 1 hour ago
  return jwt.sign(payload, secret, { expiresIn: '-1h' });
}

/**
 * Generate an invalid JWT token for testing
 */
export function generateInvalidToken(): string {
  return 'invalid.jwt.token';
}

/**
 * Create authorization header for supertest requests
 */
export function authHeader(token: string): { Authorization: string } {
  return {
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Create authorization header for a test user
 */
export function authHeaderForUser(user: User): { Authorization: string } {
  const token = generateTestToken(user);
  return authHeader(token);
}
