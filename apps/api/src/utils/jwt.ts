import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

/**
 * JWT token payload structure
 */
export interface JwtPayload {
  userId: string;
  email: string;
}

/**
 * Generate a JWT token for a user
 * @param payload - User data to include in token (userId and email)
 * @returns Signed JWT token string
 */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as string,
  } as SignOptions);
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token string to verify
 * @returns Decoded token payload if valid
 * @throws Error if token is invalid or expired
 */
export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token has expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token");
    }
    throw error;
  }
}
