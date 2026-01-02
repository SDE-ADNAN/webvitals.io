import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../utils/jwt";

/**
 * Extend Express Request type to include user from JWT
 */
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header and attaches user to request
 * Returns 401 for missing, invalid, or expired tokens
 */
export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    // Extract token from Authorization header (Bearer format)
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
      return;
    }

    // Check for Bearer format
    if (!authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Invalid authorization format. Expected: Bearer <token>",
      });
      return;
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.substring(7);

    if (!token) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Token not provided",
      });
      return;
    }

    // Verify token and attach user to request
    const decoded = verifyToken(token);
    req.user = decoded;

    next();
  } catch (error) {
    // Handle token verification errors
    if (error instanceof Error) {
      res.status(401).json({
        error: "Unauthorized",
        message: error.message,
      });
      return;
    }

    res.status(401).json({
      error: "Unauthorized",
      message: "Invalid token",
    });
  }
}
