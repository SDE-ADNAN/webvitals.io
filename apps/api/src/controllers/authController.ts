import { Request, Response } from "express";
import { registerUser, loginUser, getUserById } from "../services/authService";
import { AuthRequest } from "../middleware/auth";

/**
 * POST /api/auth/register
 * Register a new user
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, firstName, lastName } = req.body;

    const result = await registerUser({
      email,
      password,
      firstName,
      lastName,
    });

    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      const statusCode = (error as any).statusCode || 400;
      res.status(statusCode).json({
        error: statusCode === 409 ? "Conflict" : "Bad Request",
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    });
  }
}

/**
 * POST /api/auth/login
 * Login a user
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    const result = await loginUser({ email, password });

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      const statusCode = (error as any).statusCode || 400;
      res.status(statusCode).json({
        error: statusCode === 401 ? "Unauthorized" : "Bad Request",
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    });
  }
}

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
export async function getCurrentUser(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
      return;
    }

    const user = await getUserById(req.user.userId);

    res.status(200).json({ user });
  } catch (error) {
    if (error instanceof Error) {
      const statusCode = (error as any).statusCode || 500;
      res.status(statusCode).json({
        error: statusCode === 404 ? "Not Found" : "Internal Server Error",
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    });
  }
}
