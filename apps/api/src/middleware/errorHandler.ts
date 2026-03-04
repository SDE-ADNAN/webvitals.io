import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

// Custom error class for API errors
export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error response interface
interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
}

// Global error handler middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let errorType = "InternalServerError";
  let details: any = undefined;

  // Log all errors with stack traces
  console.error(`Error occurred at ${req.method} ${req.path}:`, {
    error: err.message,
    stack: err.stack,
    userId: (req as any).user?.id,
    timestamp: new Date().toISOString(),
    errorName: err.name,
    isZodError: err instanceof ZodError,
    errorConstructor: err.constructor.name,
  });

  // Handle different error types
  if (err instanceof ApiError) {
    // Custom API errors
    statusCode = err.statusCode;
    message = err.message;
    errorType = getErrorType(statusCode);
  } else if (err instanceof ZodError || err.name === "ZodError") {
    // Validation errors (400)
    statusCode = 400;
    message = "Validation failed";
    errorType = "ValidationError";
    
    // Handle ZodError properly - it has an 'issues' property, not 'errors'
    const zodError = err as ZodError;
    details = (zodError.issues || zodError.errors || []).map((error: any) => ({
      field: error.path ? error.path.join(".") : "unknown",
      message: error.message || "Validation error",
    }));
  } else if (err.name === "JsonWebTokenError") {
    // JWT errors (401)
    statusCode = 401;
    message = "Invalid token";
    errorType = "AuthenticationError";
  } else if (err.name === "TokenExpiredError") {
    // JWT expiration errors (401)
    statusCode = 401;
    message = "Token expired";
    errorType = "AuthenticationError";
  } else if (err.message.includes("duplicate key value")) {
    // Database constraint errors (409)
    statusCode = 409;
    message = "Resource already exists";
    errorType = "ConflictError";
  } else if (err.message.includes("not found")) {
    // Not found errors (404)
    statusCode = 404;
    message = "Resource not found";
    errorType = "NotFoundError";
  } else {
    // Unexpected errors (500)
    statusCode = 500;
    errorType = "InternalServerError";
    
    // Hide internal details in production
    if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "prod") {
      message = "Something went wrong";
    } else {
      message = err.message || "Internal Server Error";
    }
  }

  // Create error response
  const errorResponse: ErrorResponse = {
    error: errorType,
    message,
  };

  // Include details for validation errors
  if (details) {
    errorResponse.details = details;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

// Helper function to get error type from status code
function getErrorType(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return "ValidationError";
    case 401:
      return "AuthenticationError";
    case 403:
      return "AuthorizationError";
    case 404:
      return "NotFoundError";
    case 409:
      return "ConflictError";
    case 429:
      return "RateLimitError";
    case 500:
      return "InternalServerError";
    default:
      return "ApiError";
  }
}

// Helper functions to create specific errors
export const createValidationError = (message: string) => 
  new ApiError(400, message);

export const createAuthenticationError = (message: string = "Authentication required") => 
  new ApiError(401, message);

export const createAuthorizationError = (message: string = "You do not have permission to access this resource") => 
  new ApiError(403, message);

export const createNotFoundError = (message: string = "Resource not found") => 
  new ApiError(404, message);

export const createConflictError = (message: string = "Resource already exists") => 
  new ApiError(409, message);

export const createRateLimitError = (message: string = "Too many requests") => 
  new ApiError(429, message);