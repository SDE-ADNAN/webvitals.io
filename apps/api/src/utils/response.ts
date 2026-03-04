import { Response } from "express";

/**
 * Response Formatting Utilities
 * Requirements: 26.1-26.5
 * 
 * Provides consistent response formatting across all API endpoints:
 * - Successful responses use 200 or 201 status codes
 * - Data wrapped in consistent JSON structure
 * - Timestamps formatted in ISO 8601 format
 * - Pagination support for list endpoints
 */

/**
 * Pagination metadata interface
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
}

/**
 * Success response interface
 */
export interface SuccessResponse<T = any> {
  success?: boolean;
  data?: T;
  message?: string;
  pagination?: PaginationMeta;
  timestamp: string;
}

/**
 * Error response interface
 */
export interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
  timestamp: string;
}

/**
 * Format timestamps to ISO 8601 format
 * Requirement 26.5: All timestamps must be in ISO 8601 format
 * 
 * @param date - Date object or string to format
 * @returns ISO 8601 formatted string
 */
export function formatTimestamp(date: Date | string): string {
  if (typeof date === "string") {
    return new Date(date).toISOString();
  }
  return date.toISOString();
}

/**
 * Recursively format all Date objects in an object to ISO 8601 strings
 * 
 * @param obj - Object to process
 * @returns Object with formatted timestamps
 */
export function formatTimestampsInObject<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (obj instanceof Date) {
    return formatTimestamp(obj) as any;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => formatTimestampsInObject(item)) as any;
  }

  if (typeof obj === "object") {
    const formatted: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        formatted[key] = formatTimestampsInObject(obj[key]);
      }
    }
    return formatted;
  }

  return obj;
}

/**
 * Send a successful response with 200 status code
 * Requirement 26.1: Successful responses use 200 or 201 status codes
 * Requirement 26.2: Data wrapped in consistent JSON structure
 * 
 * @param res - Express response object
 * @param data - Data to send in response
 * @param message - Optional success message
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string
): void {
  const formattedData = formatTimestampsInObject(data);
  
  const response: SuccessResponse<T> = {
    data: formattedData,
    timestamp: formatTimestamp(new Date()),
  };

  if (message) {
    response.message = message;
  }

  res.status(200).json(response);
}

/**
 * Send a successful creation response with 201 status code
 * Requirement 26.1: Successful responses use 200 or 201 status codes
 * Requirement 26.2: Data wrapped in consistent JSON structure
 * 
 * @param res - Express response object
 * @param data - Created resource data
 * @param message - Optional success message
 */
export function sendCreated<T>(
  res: Response,
  data: T,
  message?: string
): void {
  const formattedData = formatTimestampsInObject(data);
  
  const response: SuccessResponse<T> = {
    data: formattedData,
    timestamp: formatTimestamp(new Date()),
  };

  if (message) {
    response.message = message;
  }

  res.status(201).json(response);
}

/**
 * Send a paginated list response with 200 status code
 * Requirement 26.4: Pagination support (page, limit, total) for list endpoints
 * 
 * @param res - Express response object
 * @param data - Array of items
 * @param pagination - Pagination metadata
 * @param message - Optional success message
 */
export function sendPaginatedSuccess<T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta,
  message?: string
): void {
  const formattedData = formatTimestampsInObject(data);
  
  // Calculate total pages if not provided
  const totalPages = pagination.totalPages || 
    Math.ceil(pagination.total / pagination.limit);

  const response: SuccessResponse<T[]> = {
    data: formattedData,
    pagination: {
      ...pagination,
      totalPages,
    },
    timestamp: formatTimestamp(new Date()),
  };

  if (message) {
    response.message = message;
  }

  res.status(200).json(response);
}

/**
 * Send an error response
 * Requirement 26.3: Error responses in consistent JSON structure
 * 
 * @param res - Express response object
 * @param statusCode - HTTP status code
 * @param error - Error type/name
 * @param message - Error message
 * @param details - Optional error details
 */
export function sendError(
  res: Response,
  statusCode: number,
  error: string,
  message: string,
  details?: any
): void {
  const response: ErrorResponse = {
    error,
    message,
    timestamp: formatTimestamp(new Date()),
  };

  if (details) {
    response.details = details;
  }

  res.status(statusCode).json(response);
}

/**
 * Send a 400 Bad Request error
 */
export function sendBadRequest(
  res: Response,
  message: string,
  details?: any
): void {
  sendError(res, 400, "Bad Request", message, details);
}

/**
 * Send a 401 Unauthorized error
 */
export function sendUnauthorized(
  res: Response,
  message: string = "Authentication required"
): void {
  sendError(res, 401, "Unauthorized", message);
}

/**
 * Send a 403 Forbidden error
 */
export function sendForbidden(
  res: Response,
  message: string = "You do not have permission to access this resource"
): void {
  sendError(res, 403, "Forbidden", message);
}

/**
 * Send a 404 Not Found error
 */
export function sendNotFound(
  res: Response,
  message: string = "Resource not found"
): void {
  sendError(res, 404, "Not Found", message);
}

/**
 * Send a 409 Conflict error
 */
export function sendConflict(
  res: Response,
  message: string
): void {
  sendError(res, 409, "Conflict", message);
}

/**
 * Send a 500 Internal Server Error
 */
export function sendInternalError(
  res: Response,
  message: string = "An unexpected error occurred"
): void {
  sendError(res, 500, "Internal Server Error", message);
}

/**
 * Calculate pagination metadata from query parameters
 * 
 * @param page - Page number (1-indexed)
 * @param limit - Items per page
 * @param total - Total number of items
 * @returns Pagination metadata
 */
export function calculatePagination(
  page: number = 1,
  limit: number = 10,
  total: number
): PaginationMeta {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, Math.min(100, limit)); // Max 100 items per page
  const totalPages = Math.ceil(total / safeLimit);

  return {
    page: safePage,
    limit: safeLimit,
    total,
    totalPages,
  };
}

/**
 * Parse pagination parameters from query string
 * 
 * @param query - Express request query object
 * @returns Parsed page and limit values
 */
export function parsePaginationParams(query: any): { page: number; limit: number } {
  const page = parseInt(query.page as string, 10) || 1;
  const limit = parseInt(query.limit as string, 10) || 10;

  return {
    page: Math.max(1, page),
    limit: Math.max(1, Math.min(100, limit)), // Max 100 items per page
  };
}
