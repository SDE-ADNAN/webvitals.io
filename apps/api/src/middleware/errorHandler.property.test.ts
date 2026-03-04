// Feature: backend-api, Property 5: Error Response Format
// For any error, API should return JSON with message and appropriate status code
// Validates: Requirements 19.1, 19.2

import * as fc from "fast-check";
import request from "supertest";
import express from "express";
import { errorHandler, ApiError } from "./errorHandler";
import { ZodError, z } from "zod";

describe("Property 5: Error Response Format", () => {
  let app: express.Application;
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    // Mock console.error to avoid noise in test output
    originalConsoleError = console.error;
    console.error = jest.fn();
    
    app = express();
    app.use(express.json());
    
    // Test route that throws different types of errors
    app.get("/test-error/:type", (req, res, next) => {
      const errorType = req.params.type;
      
      switch (errorType) {
        case "api":
          return next(new ApiError(400, "Test API error"));
        case "validation":
          const schema = z.object({ required: z.string() });
          try {
            schema.parse({});
          } catch (error) {
            return next(error);
          }
          break;
        case "jwt":
          const jwtError = new Error("Invalid token");
          jwtError.name = "JsonWebTokenError";
          return next(jwtError);
        case "expired":
          const expiredError = new Error("Token expired");
          expiredError.name = "TokenExpiredError";
          return next(expiredError);
        case "duplicate":
          return next(new Error("duplicate key value violates unique constraint"));
        case "notfound":
          return next(new Error("User not found"));
        case "unexpected":
          return next(new Error("Unexpected error"));
        default:
          return res.json({ success: true });
      }
    });
    
    // Add error handler middleware
    app.use(errorHandler);
  });

  afterEach(() => {
    // Restore console.error
    console.error = originalConsoleError;
  });

  it("should return JSON with error and message for any error type", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom("api", "jwt", "expired", "duplicate", "notfound", "unexpected"),
        async (errorType) => {
          await request(app)
            .get(`/test-error/${errorType}`)
            .expect((res) => {
              // Should return JSON response
              expect(res.headers["content-type"]).toMatch(/json/);
              
              // Should have error and message properties
              expect(res.body).toHaveProperty("error");
              expect(res.body).toHaveProperty("message");
              
              // Error should be a string
              expect(typeof res.body.error).toBe("string");
              
              // Message should be a string
              expect(typeof res.body.message).toBe("string");
              
              // Should have appropriate status code (not 200)
              expect(res.status).not.toBe(200);
              expect(res.status).toBeGreaterThanOrEqual(400);
              expect(res.status).toBeLessThan(600);
            });
        }
      ),
      { numRuns: 50 }
    );
  });

  it("should return appropriate status codes for different error types", async () => {
    const errorTypeToStatusCode = {
      api: 400,
      jwt: 401,
      expired: 401,
      duplicate: 409,
      notfound: 404,
      unexpected: 500
    };

    for (const [errorType, expectedStatus] of Object.entries(errorTypeToStatusCode)) {
      await request(app)
        .get(`/test-error/${errorType}`)
        .expect(expectedStatus)
        .expect((res) => {
          expect(res.body).toHaveProperty("error");
          expect(res.body).toHaveProperty("message");
        });
    }
  });

  it("should include details for validation errors", async () => {
    // Test the error handler function directly
    const zodError = new ZodError([
      {
        code: "invalid_type",
        expected: "string",
        received: "undefined",
        path: ["required"],
        message: "Required field is missing"
      }
    ]);

    const mockReq = { method: "POST", path: "/test" } as any;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;
    const mockNext = jest.fn();

    // Call error handler directly
    errorHandler(zodError, mockReq, mockRes, mockNext);

    // Verify the response
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "ValidationError",
      message: "Validation failed",
      details: [
        {
          field: "required",
          message: "Required field is missing"
        }
      ]
    });
  });
});

// Feature: backend-api, Property 24: Production Error Sanitization
// For any unexpected error in production, return 500 without internal details
// Validates: Requirements 19.5, 27.3

describe("Property 24: Production Error Sanitization", () => {
  let app: express.Application;
  let originalNodeEnv: string | undefined;
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    // Save original NODE_ENV and console.error
    originalNodeEnv = process.env.NODE_ENV;
    originalConsoleError = console.error;
    console.error = jest.fn();
    
    app = express();
    app.use(express.json());
    
    // Test route that throws unexpected errors
    app.get("/test-production-error", (req, res, next) => {
      const error = new Error("Internal database connection failed with sensitive info");
      error.stack = "Error: Internal database connection failed\n    at sensitive/path/file.js:123:45";
      return next(error);
    });
    
    // Add error handler middleware
    app.use(errorHandler);
  });

  afterEach(() => {
    // Restore original NODE_ENV and console.error
    process.env.NODE_ENV = originalNodeEnv;
    console.error = originalConsoleError;
  });

  it("should sanitize error messages in production", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom("production", "prod"),
        async (nodeEnv) => {
          // Set NODE_ENV to production
          const originalNodeEnv = process.env.NODE_ENV;
          process.env.NODE_ENV = nodeEnv;
          
          try {
            // Test the error handler function directly
            const error = new Error("Internal database connection failed with sensitive info");
            error.stack = "Error: Internal database connection failed\n    at sensitive/path/file.js:123:45";

            const mockReq = { method: "GET", path: "/test-production-error" } as any;
            const mockRes = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn().mockReturnThis(),
            } as any;
            const mockNext = jest.fn();

            // Call error handler directly
            errorHandler(error, mockReq, mockRes, mockNext);

            // Verify the response
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
              error: "InternalServerError",
              message: "Something went wrong"
            });
          } finally {
            // Restore original NODE_ENV
            process.env.NODE_ENV = originalNodeEnv;
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  it("should show detailed errors in development", async () => {
    // Set NODE_ENV to development
    process.env.NODE_ENV = "development";
    
    await request(app)
      .get("/test-production-error")
      .expect(500)
      .expect((res) => {
        // Should return JSON response
        expect(res.headers["content-type"]).toMatch(/json/);
        
        // Should have error and message properties
        expect(res.body).toHaveProperty("error", "InternalServerError");
        expect(res.body).toHaveProperty("message");
        
        // Message should contain the actual error message in development
        expect(res.body.message).toContain("Internal database connection failed");
        expect(res.body.message).not.toBe("Something went wrong");
      });
  });
});