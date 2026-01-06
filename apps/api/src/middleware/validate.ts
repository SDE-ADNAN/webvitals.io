import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

/**
 * Validation error response format
 */
export interface ValidationErrorResponse {
  error: "Validation Error";
  message: string;
  details: {
    field: string;
    message: string;
  }[];
}

/**
 * Format Zod validation errors into a consistent response structure
 * Returns field-specific error details for client-side handling
 */
export function formatValidationErrors(error: ZodError): ValidationErrorResponse {
  // Zod uses 'issues' property, not 'errors'
  const issues = error?.issues ?? [];
  
  const details = issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));

  return {
    error: "Validation Error",
    message: "Request validation failed",
    details,
  };
}

/**
 * Validation middleware factory
 * Creates middleware that validates request body against a Zod schema
 * Returns 400 with field-specific errors on validation failure
 * 
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 * 
 * Requirements: 18.1-18.5
 */
export function validate<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate request body against schema
      const result = schema.safeParse(req.body);

      if (!result.success) {
        // Return 400 with field-specific errors
        const errorResponse = formatValidationErrors(result.error);
        res.status(400).json(errorResponse);
        return;
      }

      // Replace request body with validated and sanitized data
      req.body = result.data;
      next();
    } catch (error) {
      // Handle unexpected validation errors
      res.status(400).json({
        error: "Validation Error",
        message: "An error occurred during validation",
        details: [],
      });
    }
  };
}

/**
 * Validate query parameters against a Zod schema
 * 
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req.query);

      if (!result.success) {
        const errorResponse = formatValidationErrors(result.error);
        res.status(400).json(errorResponse);
        return;
      }

      // Replace query with validated data
      req.query = result.data as any;
      next();
    } catch (error) {
      res.status(400).json({
        error: "Validation Error",
        message: "An error occurred during query validation",
        details: [],
      });
    }
  };
}

/**
 * Validate URL parameters against a Zod schema
 * 
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req.params);

      if (!result.success) {
        const errorResponse = formatValidationErrors(result.error);
        res.status(400).json(errorResponse);
        return;
      }

      req.params = result.data as any;
      next();
    } catch (error) {
      res.status(400).json({
        error: "Validation Error",
        message: "An error occurred during params validation",
        details: [],
      });
    }
  };
}
